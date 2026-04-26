import os
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import hashlib
from datetime import datetime
import pdfplumber
from groq import Groq
import io
from bson.binary import Binary
from bson.objectid import ObjectId
import uuid
from sse_starlette.sse import EventSourceResponse
import json
from bson.errors import InvalidId
from pymongo.errors import PyMongoError, ConnectionFailure

from dotenv import load_dotenv
load_dotenv()

from routers import coding
app = FastAPI(title="FastTrackHire API")

# Include Routers
app.include_router(coding.router)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request, call_next):
    print(f"DEBUG: Incoming request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        print(f"DEBUG: Response status: {response.status_code}")
        return response
    except Exception as e:
        print(f"DEBUG: Request failed: {e}")
        raise

# Database
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "MockInterviews")
print(f"DEBUG: Connecting to MongoDB at {MONGO_URI.split('@')[-1] if '@' in MONGO_URI else 'localhost'}")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    # Trigger a connection check
    client.admin.command('ping')
    print("DEBUG: MongoDB connected successfully")
    db.users.create_index("email", unique=True)
    db.interview_sessions.create_index("user_id")
    db.interview_sessions.create_index("created_at")
    db.interview_sessions.create_index("session_id", unique=True)
except Exception as e:
    print(f"DEBUG: Error connecting to MongoDB: {e}")
    db = None

@app.get("/")
def read_root():
    return {"status": "ok", "db_connected": db is not None}

# Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

from pydantic import BaseModel

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
            "created_at": datetime.utcnow()
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
    
    # In a real app, use JWT. For simplicity, we just return the user ID to be stored in frontend context/localStorage
    return {
        "token": str(user["_id"]), # Pseudo-token
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"]
        }
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
            "full_name": user["full_name"]
        }
    except Exception:
        raise HTTPException(401, "Unauthorized")

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
            {"$set": {
                "resume_pdf": Binary(file_bytes),
                "resume_text": text,
                "resume_uploaded_at": datetime.utcnow()
            }}
        )
        return {"message": "Resume uploaded successfully", "extracted_text_length": len(text)}
    except Exception as e:
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
    return {
        "uploaded_at": user.get("resume_uploaded_at"),
        "has_resume": True
    }

@app.get("/api/resume/pdf")
async def get_resume_pdf(token: str):
    if db is None:
        raise HTTPException(500, "Database not configured")
    user = db.users.find_one({"_id": ObjectId(token)}, {"resume_pdf": 1})
    if not user or not user.get("resume_pdf"):
        raise HTTPException(404, "No resume PDF found")
    
    from fastapi.responses import Response
    return Response(content=user["resume_pdf"], media_type="application/pdf")

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
        "codingRound": {
            "enabled": req.codingEnabled,
            "status": "pending"
        }
    }
    
    db.interview_sessions.insert_one(session_data)
    return {"sessionId": session_id, "company": req.companyId}

@app.get("/api/sessions")
def get_sessions(token: str):
    if db is None:
        raise HTTPException(500, "Database not configured")
    sessions = list(db.interview_sessions.find({"user_id": str(token)}).sort("last_updated", -1))
    
    # Calculate stats
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
            "completed_count": len(completed_sessions)
        }
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

class MessageRequest(BaseModel):
    content: str

@app.post("/api/sessions/{session_id}/message")
def post_message(token: str, session_id: str, req: MessageRequest):
    """
    Standard REST endpoint - processes the message and returns the full AI response.
    Note: For SSE streaming, use /api/sessions/{session_id}/message/stream instead.
    """
    if db is None or groq_client is None:
        raise HTTPException(500, "DB or Groq not configured")
        
    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session:
        raise HTTPException(404, "Session not found")
        
    chat_history = session.get("chat_history", [])
    chat_history.append({"role": "user", "content": req.content})
    
    prompt = f"You are an interviewer from **{session['company']}** conducting a technical interview.\n## Candidate Resume:\n{session.get('resume_text', 'No resume provided')}\n\n**Instructions:**\n1. Start by asking 3 DSA questions (medium-hard) based on {session['company']} level.\n2. Ask only one question at a time. Wait for candidate response.\n3. Then ask 3-4 resume-based questions.\n4. When done, provide summary feedback."
    
    messages = [{"role": "system", "content": prompt}] + chat_history
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7
        )
        ai_response = response.choices[0].message.content
        chat_history.append({"role": "assistant", "content": ai_response})
        
        # Determine if complete
        completed = False
        if any(p in ai_response.lower() for p in ["you are selected", "not selected", "feedback:"]):
            completed = True
            
        db.interview_sessions.update_one(
            {"session_id": session_id},
            {"$set": {
                "chat_history": chat_history,
                "last_updated": datetime.utcnow(),
                "completed": completed
            }}
        )
        return {"role": "assistant", "content": ai_response, "completed": completed}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/api/sessions/{session_id}/message/stream")
async def post_message_stream(token: str, session_id: str, content: str):
    """
    SSE Streaming endpoint for real-time AI response.
    """
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
        f"5. IMPORTANT: When you have concluded all questions, you MUST explicitly state 'The interview is now complete. Generating your feedback report...' followed by 'FEEDBACK:' to trigger the completion logic."
    )
    
    messages = [{"role": "system", "content": prompt}] + chat_history
    
    async def event_generator():
        try:
            stream = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                temperature=0.7,
                stream=True
            )
            full_response = ""
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    word = chunk.choices[0].delta.content
                    full_response += word
                    yield {"data": json.dumps({"token": word})}
            
            # Save after stream completes
            chat_history.append({"role": "assistant", "content": full_response})
            # Robust completion detection
            lower_response = full_response.lower()
            completed = any(p in lower_response for p in [
                "you are selected", 
                "not selected", 
                "feedback:", 
                "interview is now complete",
                "generating your feedback report"
            ])
            db.interview_sessions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "chat_history": chat_history,
                    "last_updated": datetime.utcnow(),
                    "completed": completed
                }}
            )
            yield {"event": "done", "data": json.dumps({"completed": completed, "full_response": full_response})}
        except Exception as e:
            yield {"event": "error", "data": str(e)}

    return EventSourceResponse(event_generator())

@app.post("/api/sessions/{session_id}/complete")
def complete_session(token: str, session_id: str):
    if db is None or groq_client is None:
        raise HTTPException(500, "DB or Groq not configured")
        
    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session:
        raise HTTPException(404, "Session not found")
        
    # Generate structured feedback
    chat_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in session.get("chat_history", [])])
    
    coding_context = ""
    if "codingRound" in session and session["codingRound"].get("status") == "completed":
        cr = session["codingRound"]
        latest_sub = cr["submissions"][-1] if cr["submissions"] else None
        if latest_sub:
            eval_data = latest_sub["evaluation"]
            coding_context = f"\n\n## Coding Round Results:\nScore: {eval_data.get('overall_score')}/100\nVerdict: {eval_data.get('verdict')}\nSummary: {eval_data.get('summary')}"
    
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
            response_format={"type": "json_object"}
        )
        feedback_json = json.loads(response.choices[0].message.content)
        
        db.interview_sessions.update_one(
            {"session_id": session_id},
            {"$set": {
                "completed": True,
                "feedback": feedback_json,
                "completed_at": datetime.utcnow()
            }}
        )
        return feedback_json
    except Exception as e:
        raise HTTPException(500, f"Error generating feedback: {str(e)}")

@app.get("/api/sessions/{session_id}/feedback")
def get_feedback(token: str, session_id: str):
    if db is None:
        raise HTTPException(500, "Database not configured")
    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session or "feedback" not in session:
        raise HTTPException(404, "Feedback not found")
    return session["feedback"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
