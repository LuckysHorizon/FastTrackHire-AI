from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Optional
from datetime import datetime
import uuid

from services.rate_limiter import rate_limiter
from services.groq_coding import groq_coding_service
from services.judge0 import judge0_service, TestCase
from bson.objectid import ObjectId

router = APIRouter(prefix="/api/sessions/{session_id}/coding")

def get_db():
    from main import db
    if db is None:
        raise HTTPException(500, "Database not connected")
    return db

@router.post("/generate")
async def generate_coding_round(session_id: str, token: str, language: str = Body(..., embed=True), db=Depends(get_db)):
    """Generate a new coding question via Groq AI and initialize the coding round."""
    user = db.users.find_one({"_id": ObjectId(token)})
    if not user:
        raise HTTPException(401, "Unauthorized")
    
    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session:
        raise HTTPException(404, "Session not found")
    
    # Don't regenerate if already in progress
    existing = session.get("codingRound", {})
    if existing.get("status") == "in_progress" and existing.get("question"):
        sanitized = existing["question"].copy()
        sanitized.pop("hidden_test_cases", None)
        return {
            "question": sanitized,
            "started_at": existing.get("start_time"),
            "time_limit_seconds": 2700
        }
    
    await rate_limiter.check_limit(token, "generate_question")
    
    # Generate question via Groq
    question_data = await groq_coding_service.generate_coding_question(
        user.get("resume_text", ""), 
        session["company"], 
        language
    )
    
    # Build coding round document
    coding_round = {
        "enabled": True,
        "status": "in_progress",
        "language": language,
        "start_time": datetime.utcnow(),
        "question": question_data,
        "submissions": [],
        "hints_used": 0,
        "runs_count": 0,
        "total_runs": 0,
        "total_submissions": 0,
        "final_score": None,
        "final_evaluation": None,
        "completed_at": None
    }
    
    db.interview_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"codingRound": coding_round}}
    )
    
    # Return without hidden test cases
    sanitized_question = question_data.copy()
    sanitized_question.pop("hidden_test_cases", None)
    
    return {
        "question": sanitized_question,
        "started_at": coding_round["start_time"],
        "time_limit_seconds": 2700
    }

@router.post("/run")
async def run_code(
    session_id: str, 
    token: str, 
    source_code: str = Body(...), 
    language: str = Body(...),
    db=Depends(get_db)
):
    """Run code against visible test cases only (practice run)."""
    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session or "codingRound" not in session:
        raise HTTPException(404, "Coding round not initialized")
    
    await rate_limiter.check_limit(token, "run_code")
    
    question = session["codingRound"]["question"]
    test_cases = [TestCase(**tc) for tc in question["visible_test_cases"]]
    
    lang_id = judge0_service.get_language_id(language)
    results = await judge0_service.run_test_cases(source_code, lang_id, test_cases)
    
    # Increment run counter
    db.interview_sessions.update_one(
        {"session_id": session_id},
        {"$inc": {"codingRound.runs_count": 1, "codingRound.total_runs": 1}}
    )
    
    return {"results": [r.dict() for r in results]}

@router.post("/submit")
async def submit_code(
    session_id: str, 
    token: str, 
    source_code: str = Body(...), 
    language: str = Body(...),
    is_final: bool = Body(True),
    db=Depends(get_db)
):
    """Submit code for evaluation against ALL test cases (visible + hidden)."""
    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session or "codingRound" not in session:
        raise HTTPException(404, "Coding round not initialized")
    
    cr = session["codingRound"]
    if cr.get("status") == "completed":
        raise HTTPException(400, "Coding round already completed")
    
    await rate_limiter.check_limit(token, "submit_code")
    
    question = cr["question"]
    
    # Run against ALL test cases (visible + hidden)
    visible = [TestCase(**tc) for tc in question["visible_test_cases"]]
    hidden = [TestCase(**tc, is_hidden=True) for tc in question.get("hidden_test_cases", [])]
    all_cases = visible + hidden
    
    lang_id = judge0_service.get_language_id(language)
    results = await judge0_service.run_test_cases(source_code, lang_id, all_cases)
    
    # Calculate time taken
    start_time = cr.get("start_time", datetime.utcnow())
    time_taken = int((datetime.utcnow() - start_time).total_seconds())
    
    # AI Evaluation via Groq
    evaluation = await groq_coding_service.evaluate_submission(
        question["title"],
        source_code,
        language,
        results,
        time_taken
    )
    
    # Build submission record
    passed_count = len([r for r in results if r.passed])
    total_count = len(results)
    visible_results = [r.dict() for r in results if not r.is_hidden]
    hidden_results_summary = {
        "passed": len([r for r in results if r.is_hidden and r.passed]),
        "total": len([r for r in results if r.is_hidden])
    }
    
    submission = {
        "id": str(uuid.uuid4()),
        "submitted_at": datetime.utcnow(),
        "source_code": source_code,
        "language": language,
        "visible_test_results": visible_results,
        "hidden_test_summary": hidden_results_summary,
        "all_test_results": [r.dict() for r in results],
        "passed_count": passed_count,
        "total_count": total_count,
        "pass_rate": round(passed_count / max(total_count, 1) * 100, 1),
        "evaluation": evaluation,
        "time_taken_seconds": time_taken,
        "is_final": is_final
    }
    
    update_ops = {
        "$push": {"codingRound.submissions": submission},
        "$inc": {"codingRound.total_submissions": 1}
    }
    
    if is_final:
        update_ops["$set"] = {
            "codingRound.status": "completed",
            "codingRound.final_score": evaluation.get("overall_score", 0),
            "codingRound.final_evaluation": evaluation,
            "codingRound.completed_at": datetime.utcnow(),
            "codingRound.final_code": source_code,
            "codingRound.final_language": language,
            "codingRound.time_taken_seconds": time_taken,
            "codingRound.pass_rate": submission["pass_rate"]
        }
        
    db.interview_sessions.update_one({"session_id": session_id}, update_ops)
    
    return {
        "evaluation": evaluation,
        "test_results": visible_results,
        "hidden_summary": hidden_results_summary,
        "submission_id": submission["id"],
        "is_final": is_final
    }

@router.get("/status")
async def get_coding_status(session_id: str, token: str, db=Depends(get_db)):
    """Get current coding round status."""
    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session or "codingRound" not in session:
        return {"status": "pending"}
    
    cr = session["codingRound"]
    elapsed = 0
    if cr.get("start_time"):
        elapsed = int((datetime.utcnow() - cr["start_time"]).total_seconds())
    
    return {
        "status": cr["status"],
        "language": cr.get("language"),
        "time_elapsed_seconds": elapsed,
        "final_score": cr.get("final_score"),
        "total_runs": cr.get("total_runs", 0),
        "total_submissions": cr.get("total_submissions", 0)
    }

@router.get("/feedback")
async def get_coding_feedback(session_id: str, token: str, db=Depends(get_db)):
    """Get detailed coding round feedback after completion."""
    session = db.interview_sessions.find_one({"session_id": session_id, "user_id": str(token)})
    if not session or "codingRound" not in session:
        raise HTTPException(404, "Coding round not found")
    
    cr = session["codingRound"]
    if cr.get("status") != "completed":
        raise HTTPException(400, "Coding round not yet completed")
    
    # Get the final submission
    final_sub = None
    for sub in reversed(cr.get("submissions", [])):
        if sub.get("is_final"):
            final_sub = sub
            break
    
    return {
        "question_title": cr.get("question", {}).get("title", ""),
        "difficulty": cr.get("question", {}).get("difficulty", ""),
        "language": cr.get("language"),
        "final_score": cr.get("final_score"),
        "evaluation": cr.get("final_evaluation"),
        "time_taken_seconds": cr.get("time_taken_seconds"),
        "pass_rate": cr.get("pass_rate"),
        "total_runs": cr.get("total_runs", 0),
        "total_submissions": cr.get("total_submissions", 0),
        "final_code": cr.get("final_code"),
        "submitted_at": final_sub.get("submitted_at") if final_sub else None
    }
