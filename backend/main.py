import os
import logging
import json
import io
import uuid
import hashlib
from datetime import datetime

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, ConnectionFailure
from bson.objectid import ObjectId
from bson.binary import Binary

import pdfplumber
from groq import Groq
from dotenv import load_dotenv

# ─── Configuration ───────────────────────────────────────────────
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("fasttrack")

# ─── App Initialization ─────────────────────────────────────────
app = FastAPI(
    title="FastTrackHire API",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT", "production") != "production" else None,
    redoc_url=None,
)

# Include Routers
from routers import coding
app.include_router(coding.router)

# ─── CORS ────────────────────────────────────────────────────────
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Database ────────────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "MockInterviews")

db = None
try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
        maxPoolSize=10,
        retryWrites=True,
    )
    db = client[DB_NAME]
    client.admin.command("ping")
    logger.info("MongoDB connected successfully")
    db.users.create_index("email", unique=True)
    db.interview_sessions.create_index("user_id")
    db.interview_sessions.create_index("created_at")
    db.interview_sessions.create_index("session_id", unique=True)
except ConnectionFailure as e:
    logger.error(f"MongoDB connection failed: {e}")
except Exception as e:
    logger.error(f"MongoDB init error: {e}")

# ─── Groq ────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# ─── Health Check ────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"status": "ok", "db_connected": db is not None}

@app.get("/health")
def health_check():
    """Render health check endpoint."""
    healthy = True
    checks = {}

    # Database
    try:
        if db is not None:
            client.admin.command("ping")
            checks["database"] = "connected"
        else:
            checks["database"] = "disconnected"
            healthy = False
    except Exception:
        checks["database"] = "unreachable"
        healthy = False

    # Groq
    checks["groq"] = "configured" if groq_client else "missing"
    if not groq_client:
        healthy = False

    status_code = 200 if healthy else 503
    return Response(
        content=json.dumps({"status": "healthy" if healthy else "degraded", "checks": checks}),
        media_type="application/json",
        status_code=status_code,
    )

# ─── Auth ────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

class SignupRequest(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/signup")
def signup(req: SignupRequest):
    if db is None:
        raise HTTPException(500, "Database not configured")
    try:
        user_data = {
            "email": req.email,
            "password": hash_password(req.password),
            "full_name": f"{req.firstName} {req.lastName}".strip(),
            "created_at": datetime.utcnow(),
        }
        result = db.users.insert_one(user_data)
        return {"id": str(result.inserted_id), "message": "User created"}
    except DuplicateKeyError:
        raise HTTPException(400, "Email already exists")

@app.post("/api/auth/login")
def login(req: LoginRequest):
    if db is None:
        raise HTTPException(500, "Database not configured")
    user = db.users.find_one({"email": req.email, "password": hash_password(req.password)})
    if not user:
        raise HTTPException(401, "Invalid email or password")

    return {
        "token": str(user["_id"]),
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
        },
    }

@app.get("/api/auth/me")
def get_me(token: str):
    if db is None:
        raise HTTPException(500, "Database not configured")
    try:
        if not ObjectId.is_valid(token):
            raise HTTPException(401, "Invalid session token")
        user = db.users.find_one({"_id": ObjectId(token)})
        if not user:
            raise HTTPException(401, "Unauthorized")
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
        }
    except Exception:
        raise HTTPException(401, "Unauthorized")

# ─── Resume ──────────────────────────────────────────────────────
@app.post("/api/resume/upload")
async def upload_resume(token: str = Form(...), file: UploadFile = File(...)):
    if db is None:
        raise HTTPException(500, "Database not configured")

    if not ObjectId.is_valid(token):
        raise HTTPException(400, "Invalid user ID")

    try:
        file_bytes = await file.read()
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])

        if len(text) < 100:
            raise HTTPException(400, "Could not extract sufficient text from PDF")

        db.users.update_one(
            {"_id": ObjectId(token)},
            {
                "$set": {
                    "resume_pdf": Binary(file_bytes),
                    "resume_text": text,
                    "resume_uploaded_at": datetime.utcnow(),
                }
            },
        )
        return {"message": "Resume uploaded successfully", "extracted_text_length": len(text)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume upload error: {e}")
        raise HTTPException(500, f"Error processing PDF: {str(e)}")

@app.get("/api/resume")
def get_resume(token: str):
    if db is None:
        raise HTTPException(500, "Database not configured")

    if not ObjectId.is_valid(token):
        raise HTTPException(400, "Invalid user ID")

    user = db.users.find_one({"_id": ObjectId(token)}, {"resume_text": 1, "resume_uploaded_at": 1})
    if not user or not user.get("resume_text"):
        raise HTTPException(404, "No resume found")
    return {"uploaded_at": user.get("resume_uploaded_at"), "has_resume": True}

@app.get("/api/resume/pdf")
async def get_resume_pdf(token: str):
    if db is None:
        raise HTTPException(500, "Database not configured")
    user = db.users.find_one({"_id": ObjectId(token)}, {"resume_pdf": 1})
    if not user or not user.get("resume_pdf"):
        raise HTTPException(404, "No resume PDF found")

    return Response(content=user["resume_pdf"], media_type="application/pdf")

# ─── Sessions ────────────────────────────────────────────────────
class CreateSessionRequest(BaseModel):
    companyId: str
    codingEnabled: bool = False

@app.post("/api/sessions/create")
def create_session(token: str, req: CreateSessionRequest):
    if db is None:
        raise HTTPException(500, "Database not configured")

    user = db.users.find_one({"_id": ObjectId(token)})
    if not user:
        raise HTTPException(401, "Unauthorized")

    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "user_id": str(user["_id"]),
        "company": req.companyId,
        "resume_text": user.get("resume_text", ""),
        "chat_history": [],
        "completed": False,
        "created_at": datetime.utcnow(),
        "last_updated": datetime.utcnow(),
        "codingRound": {"enabled": req.codingEnabled, "status": "pending"},
    }

    db.interview_sessions.insert_one(session_data)
    return {"sessionId": session_id, "company": req.companyId}

@app.get("/api/sessions")
def get_sessions(token: str):
    if db is None:
        raise HTTPException(500, "Database not configured")
    sessions = list(db.interview_sessions.find({"user_id": str(token)}).sort("last_updated", -1))

    completed_sessions = [s for s in sessions if s.get("completed") and s.get("feedback")]
    avg_score = 0
    if completed_sessions:
        avg_score = sum(s["feedback"]["overallScore"] for s in completed_sessions) / len(completed_sessions)

    for s in sessions:
        s["_id"] = str(s["_id"])

    return {
        "sessions": sessions,
        "stats": {
            "avg_score": round(avg_score, 1),
            "total_count": len(sessions),
            "completed_count": len(completed_sessions),
        },
    }

@app.get("/api/sessions/{session_id}")
def get_session(token: str, session_id: str):
    if db is None:
        raise HTTPException(500, "Database not configured")
    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session:
        raise HTTPException(404, "Session not found")
    session["_id"] = str(session["_id"])
    return session

# ─── Messaging ───────────────────────────────────────────────────
class MessageRequest(BaseModel):
    content: str

@app.post("/api/sessions/{session_id}/message")
def post_message(token: str, session_id: str, req: MessageRequest):
    """Standard REST endpoint — returns the full AI response."""
    if db is None or groq_client is None:
        raise HTTPException(500, "DB or Groq not configured")

    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session:
        raise HTTPException(404, "Session not found")

    chat_history = session.get("chat_history", [])
    chat_history.append({"role": "user", "content": req.content})

    prompt = (
        f"You are an interviewer from **{session['company']}** conducting a technical interview.\n"
        f"## Candidate Resume:\n{session.get('resume_text', 'No resume provided')}\n\n"
        f"**Instructions:**\n"
        f"1. Start by asking 3 DSA questions (medium-hard) based on {session['company']} level.\n"
        f"2. Ask only one question at a time. Wait for candidate response.\n"
        f"3. Then ask 3-4 resume-based questions.\n"
        f"4. When done, provide summary feedback."
    )

    messages = [{"role": "system", "content": prompt}] + chat_history

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
        )
        ai_response = response.choices[0].message.content
        chat_history.append({"role": "assistant", "content": ai_response})

        completed = any(
            p in ai_response.lower()
            for p in ["you are selected", "not selected", "feedback:"]
        )

        db.interview_sessions.update_one(
            {"session_id": session_id},
            {"$set": {"chat_history": chat_history, "last_updated": datetime.utcnow(), "completed": completed}},
        )
        return {"role": "assistant", "content": ai_response, "completed": completed}
    except Exception as e:
        logger.error(f"Message error: {e}")
        raise HTTPException(500, str(e))

@app.get("/api/sessions/{session_id}/message/stream")
async def post_message_stream(token: str, session_id: str, content: str):
    """SSE Streaming endpoint for real-time AI response."""
    if db is None or groq_client is None:
        raise HTTPException(500, "DB or Groq not configured")

    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session:
        raise HTTPException(404, "Session not found")

    chat_history = session.get("chat_history", [])
    chat_history.append({"role": "user", "content": content})

    prompt = (
        f"You are a Senior Technical Interviewer from **{session['company']}**.\n"
        f"## Candidate Background:\n{session.get('resume_text', 'No resume provided')}\n\n"
        f"**Guidelines:**\n"
        f"1. Conduct a rigorous technical assessment similar to **{session['company']}** bar.\n"
        f"2. Phase 1: DSA (3 questions). Start with one medium question. Wait for code/logic. Then iterate.\n"
        f"3. Phase 2: Resume Deep Dive (3 questions). Probe into architectural decisions and tech stack mentioned.\n"
        f"4. Maintain a professional, slightly demanding but fair tone.\n"
        f"5. IMPORTANT: When you have concluded all questions, you MUST explicitly state "
        f"'The interview is now complete. Generating your feedback report...' followed by 'FEEDBACK:' to trigger the completion logic."
    )

    messages = [{"role": "system", "content": prompt}] + chat_history

    async def event_generator():
        try:
            stream = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                temperature=0.7,
                stream=True,
            )
            full_response = ""
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    word = chunk.choices[0].delta.content
                    full_response += word
                    yield {"data": json.dumps({"token": word})}

            chat_history.append({"role": "assistant", "content": full_response})
            lower_response = full_response.lower()
            completed = any(
                p in lower_response
                for p in [
                    "you are selected",
                    "not selected",
                    "feedback:",
                    "interview is now complete",
                    "generating your feedback report",
                ]
            )
            db.interview_sessions.update_one(
                {"session_id": session_id},
                {"$set": {"chat_history": chat_history, "last_updated": datetime.utcnow(), "completed": completed}},
            )
            yield {"event": "done", "data": json.dumps({"completed": completed, "full_response": full_response})}
        except Exception as e:
            logger.error(f"SSE stream error: {e}")
            yield {"event": "error", "data": str(e)}

    return EventSourceResponse(event_generator())

# ─── Feedback ────────────────────────────────────────────────────
@app.post("/api/sessions/{session_id}/complete")
def complete_session(token: str, session_id: str):
    if db is None or groq_client is None:
        raise HTTPException(500, "DB or Groq not configured")

    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session:
        raise HTTPException(404, "Session not found")

    chat_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in session.get("chat_history", [])])

    coding_context = ""
    if "codingRound" in session and session["codingRound"].get("status") == "completed":
        cr = session["codingRound"]
        latest_sub = cr["submissions"][-1] if cr.get("submissions") else None
        if latest_sub:
            eval_data = latest_sub["evaluation"]
            coding_context = (
                f"\n\n## Coding Round Results:\n"
                f"Score: {eval_data.get('overall_score')}/100\n"
                f"Verdict: {eval_data.get('verdict')}\n"
                f"Summary: {eval_data.get('summary')}"
            )

    prompt = f"""
    Analyze the following interview chat log and generate a structured JSON feedback report.
    Do NOT return markdown. Return ONLY valid JSON matching this schema exactly:
    {{
      "overallScore": number (0-100),
      "dsaScore": number,
      "resumeScore": number,
      "communicationScore": number,
      "performanceLabel": string (e.g. "Strong Performance"),
      "strengths": [string],
      "improvements": [string],
      "nextSteps": [string],
      "questionBreakdown": [
        {{
          "questionNumber": number,
          "questionTitle": string,
          "performanceRating": "excellent" | "good" | "needs_work",
          "feedback": string
        }}
      ]
    }}
    
    Interview Log:
    {chat_text}
    {coding_context}
    """

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        feedback_json = json.loads(response.choices[0].message.content)

        db.interview_sessions.update_one(
            {"session_id": session_id},
            {"$set": {"completed": True, "feedback": feedback_json, "completed_at": datetime.utcnow()}},
        )
        return feedback_json
    except Exception as e:
        logger.error(f"Feedback generation error: {e}")
        raise HTTPException(500, f"Error generating feedback: {str(e)}")

@app.get("/api/sessions/{session_id}/feedback")
def get_feedback(token: str, session_id: str):
    if db is None:
        raise HTTPException(500, "Database not configured")
    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session or "feedback" not in session:
        raise HTTPException(404, "Feedback not found")
    return session["feedback"]

# ─── Startup ─────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
