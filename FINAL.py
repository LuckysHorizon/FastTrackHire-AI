import streamlit as st
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, ConnectionFailure
import hashlib
from datetime import datetime
import pdfplumber
from groq import Groq
import os

try:
    from dotenv import load_dotenv
except Exception:
    # If python-dotenv isn't installed in the environment, provide a no-op
    def load_dotenv(*args, **kwargs):
        return False


import base64

# Load environment variables from .env file
load_dotenv()
import uuid
import io
from bson.binary import Binary
from bson.objectid import ObjectId


def load_css():
    st.markdown(
        """
    <style>
        /* Global styles */
        .stApp {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow-x: hidden;
        }

        /* Header styles */
        .header {
            background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
            color: white;
            padding: 3rem 2rem;
            border-radius: 0 0 30px 30px;
            margin-bottom: 2.5rem;
            box-shadow: 0 12px 32px rgba(0,0,0,0.2);
            text-align: center;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotateGlow 10s linear infinite;
            z-index: -1;
        }

        .header h1 {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            background: linear-gradient(to right, #ffffff, #a5b4fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .header p {
            font-size: 1.3rem;
            opacity: 0.9;
            font-weight: 300;
        }

        /* Hero box used for login/signup title */
        .hero-box {
            background: rgba(255,255,255,0.03);
            backdrop-filter: blur(8px);
            border-radius: 18px;
            padding: 2.2rem 2.5rem;
            margin: 1.5rem auto;
            max-width: 760px;
            border: 1px solid rgba(255,255,255,0.06);
            box-shadow: 0 12px 30px rgba(0,0,0,0.2);
            text-align: center;
        }

        .hero-box h2 {
            margin: 0;
            border-radius: 18px;
            font-size: 1.6rem;
            color: #a5b4fc;
            font-weight: 700;
            letter-spacing: 0.3px;
        }

        /* Card styles */
        .card {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2.5rem;
            margin-bottom: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 16px 40px rgba(0,0,0,0.2);
        }

        /* Hide decorative/empty cards that don't contain forms (removes stray empty boxes) */
        .card:not(:has(form)) {
            display: none !important;
        }

        /* Button styles */
        .stButton>button {
            background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
            color: white;
            border: none;
            border-radius: 14px;
            padding: 1rem 2rem;
            font-weight: 700;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            width: 100%;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stButton>button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
            background: linear-gradient(135deg, #6d28d9 0%, #2563eb 100%);
        }

        /* Chat container */
        .chat-container {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(8px);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            max-height: 600px;
            overflow-y: auto;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        /* Chat bubbles */
        .user-bubble {
            display: flex;
            align-items: center;
            background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
            color: white;
            border-radius: 20px 20px 0 20px;
            padding: 1.2rem 1.8rem;
            margin: 0.8rem 1.5rem;
            margin-left: 30%;
            box-shadow: 0 6px 16px rgba(124, 58, 237, 0.3);
            max-width: 65%;
            word-wrap: break-word;
            animation: slideInRight 0.4s ease-out;
            font-size: 1rem;
        }

        .assistant-bubble {
            display: flex;
            align-items: center;
            background: rgba(255,255,255,0.05);
            color: #e2e8f0;
            border-radius: 20px 20px 20px 0;
            padding: 1.2rem 1.8rem;
            margin: 0.8rem 1.5rem;
            margin-right: 30%;
            box-shadow: 0 6px 16px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.1);
            max-width: 65%;
            word-wrap: break-word;
            animation: slideInLeft 0.4s ease-out;
            font-size: 1rem;
        }

        /* Chat icons */
        .chat-icon {
            font-size: 1.5rem;
            margin-right: 1rem;
            flex-shrink: 0;
        }

        .user-bubble .chat-icon {
            color: #ffffff;
        }

        .assistant-bubble .chat-icon {
            color: #a5b4fc;
        }

        /* Sidebar styles */
        [data-testid="stSidebar"] {
            background: linear-gradient(135deg, #1e293b 0%, #2d3748 100%) !important;
            color: #e2e8f0 !important;
            padding-top: 1.5rem;
            padding-bottom: 200px !important;
            border-right: 1px solid rgba(255,255,255,0.1);
            position: relative;
        }

        .sidebar-profile {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 2.5rem;
            border-radius: 20px;
            margin: 1.5rem;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .sidebar-profile-avatar {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
            border-radius: 50%;
            margin: 0 auto 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: white;
            font-weight: 800;
            box-shadow: 0 6px 16px rgba(124, 58, 237, 0.3);
            border: 2px solid rgba(255,255,255,0.2);
        }

        /* Input styles */
        .stTextInput>div>div>input, .stChatInput>div>textarea {
            border-radius: 14px !important;
            padding: 14px 20px !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            background: rgba(255,255,255,0.05) !important;
            color: #e2e8f0 !important;
            transition: all 0.3s ease;
            font-size: 1rem;
        }

        /* Placeholder text color for inputs/textareas (login/signup) */
        .card input::placeholder,
        .card textarea::placeholder,
        .stTextInput>div>div>input::placeholder,
        .stChatInput>div>textarea::placeholder,
        input::placeholder,
        textarea::placeholder {
            color: #000000 !important;
            opacity: 1 !important;
        }

        /* Vendor-prefixed placeholders for broader compatibility */
        .card input::-webkit-input-placeholder,
        .card textarea::-webkit-input-placeholder,
        input::-webkit-input-placeholder,
        textarea::-webkit-input-placeholder {
            color: #000000 !important;
            opacity: 1 !important;
        }

        .card input:-ms-input-placeholder,
        .card textarea:-ms-input-placeholder,
        input:-ms-input-placeholder,
        textarea:-ms-input-placeholder {
            color: #000000 !important;
            opacity: 1 !important;
        }

        /* Typed text color inside card forms (login/signup) for better visibility */
        .card input,
        .card textarea,
        .card .stTextInput>div>div>input,
        .card .stChatInput>div>textarea {
            color: #000000 !important;
        }

        .card .stTextInput>div>div>input:focus,
        .card .stChatInput>div>textarea:focus {
            color: #000000 !important;
        }

        /* Ensure form labels (e.g., Login / Signup fields) are visible on dark background */
        .card label, .stTextInput label, .stSelectbox label, .stForm label,
        form label, label {
            color: #ffffff !important;
        }

        .stTextInput>div>div>input:focus, .stChatInput>div>textarea:focus {
            border-color: #7c3aed !important;
            box-shadow: 0 0 12px rgba(124, 58, 237, 0.3) !important;
            background: rgba(255,255,255,0.1) !important;
        }

        /* Wide chat input */
        .stChatInput {
            width: 100% !important;
            max-width: 1200px !important;
            margin: 0 auto !important;
        }

        .stChatInput>div>textarea {
            width: 100% !important;
            min-width: 800px !important;
            max-width: 100% !important;
        }

        /* Selectbox styles */
        .stSelectbox>div>div>select {
            border-radius: 14px !important;
            padding: 14px 20px !important;
            background: rgba(255,255,255,0.05) !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            color: #e2e8f0 !important;
            font-size: 1rem;
        }

        /* Progress bar */
        .stProgress>div>div>div {
            background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%) !important;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 12px;
        }

        ::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
            border-radius: 10px;
            border: 2px solid rgba(255,255,255,0.05);
        }

        /* Animations */
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes rotateGlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
            animation: fadeIn 0.6s ease-out forwards;
        }

        /* Instructions card */
        .instructions-card {
            background: rgba(255,255,255,0.08);
            border-radius: 15px;
            padding: 1.5rem;
            margin: 1rem 0;
            border: 1px solid rgba(255,255,255,0.1);
            font-size: 0.95rem;
            line-height: 1.6;
            color: #cbd5e1;
        }

        .instructions-card h4 {
            color: #a5b4fc;
            margin-bottom: 0.8rem;
            font-size: 1.1rem;
        }

        /* Footer styles - Only in sidebar */
        .sidebar-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 264px;
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(12px);
            padding: 1.2rem 1rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            text-align: center;
            color: #cbd5e1;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
        }

        .sidebar-footer-disclaimer {
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(8px);
            border-radius: 10px;
            padding: 0.8rem 1rem;
            margin-bottom: 0.6rem;
            border: 1px solid rgba(255,255,255,0.15);
            font-size: 0.75rem;
            line-height: 1.4;
            color: #a5b4fc;
        }

        .sidebar-footer-copyright {
            font-size: 0.7rem;
            color: rgba(255,255,255,0.6);
            margin-top: 0.3rem;
        }
    </style>
    """,
        unsafe_allow_html=True,
    )

    # View / Download Resume
    if st.session_state.get("user_id"):
        try:
            has_local = st.session_state.get("resume_uploaded", False)
            has_db = False
            # check DB for resume if not uploaded in this session
            if not has_local:
                db = get_db_connection()
                if db is not None:
                    try:
                        uid = ObjectId(st.session_state.user_id)
                        doc = db.users.find_one({"_id": uid}, {"resume_pdf": 1})
                        has_db = bool(doc and doc.get("resume_pdf"))
                    except Exception:
                        has_db = False

            if has_local or has_db:
                # determine filename to display
                display_name = st.session_state.get("resume_filename") or (
                    f"{st.session_state.get('user_email') or 'resume'}_resume.pdf"
                )

                # Show the filename as a clickable button to open preview
                if st.button(display_name, key="open_resume_name"):
                    st.session_state.show_resume_preview = True

                cols = st.columns([1, 1])
                with cols[0]:
                    # Download button
                    data = st.session_state.get("resume_bytes") or get_user_resume(
                        st.session_state.user_id
                    )
                    if data:
                        fname = display_name
                        st.download_button(
                            "Download Resume",
                            data,
                            file_name=fname,
                            mime="application/pdf",
                        )
                with cols[1]:
                    # Quick action to open preview too
                    if st.button("Preview", key="preview_button"):
                        st.session_state.show_resume_preview = True

                # If requested by the user, embed the PDF for preview
                if st.session_state.get("show_resume_preview"):
                    try:
                        preview_data = st.session_state.get(
                            "resume_bytes"
                        ) or get_user_resume(st.session_state.user_id)
                        if preview_data:
                            b64 = base64.b64encode(preview_data).decode("utf-8")
                            pdf_display = f'<iframe src="data:application/pdf;base64,{b64}" width="100%" height="600px" style="border: none;"></iframe>'
                            st.components.v1.html(pdf_display, height=600)
                            if st.button("Close Preview", key="close_preview"):
                                st.session_state.show_resume_preview = False
                        else:
                            st.error("No resume PDF found to preview.")
                    except Exception as e:
                        st.error(f"Error rendering preview: {str(e)}")
        except Exception:
            pass


load_css()


# Session States
def init_session_state():
    session_vars = {
        "chat_history": [],
        "progress": 0,
        "question_count": 0,
        "interview_complete": False,
        "current_stage": "pre_start",
        "pdf_text": "",
        "logged_in": False,
        "user_email": "",
        "show_login": True,
        "show_signup": False,
        "user_id": None,
        "full_name": "",
        "company": "",
        "resume_uploaded": False,
        "resume_bytes": None,
        "resume_filename": "",
        "show_resume_preview": False,
    }
    for key, value in session_vars.items():
        if key not in st.session_state:
            st.session_state[key] = value


init_session_state()
# Database Configuration
try:
    MONGO_URI = os.getenv("MONGO_URI") or st.secrets.get("MONGO_URI", "")
    DB_NAME = os.getenv("DB_NAME") or st.secrets.get("DB_NAME", "MockInterviews")
except Exception:
    MONGO_URI = os.getenv("MONGO_URI", "")
    DB_NAME = os.getenv("DB_NAME", "MockInterviews")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000) if MONGO_URI else None


def get_db_connection():
    if client is None:
        return None
    try:
        client.admin.command("ping")
        db = client[DB_NAME]
        return db
    except ConnectionFailure as e:
        st.error(f"🔌 Connection Error: {str(e)}")
        return None
    except Exception as e:
        st.error(f"⚠️ Database Error: {str(e)}")
        return None


def init_db():
    db = get_db_connection()
    if db is not None:
        try:
            db.users.create_index("email", unique=True)
            db.interview_sessions.create_index("user_id")
            db.interview_sessions.create_index("created_at")
            return True
        except Exception as e:
            st.error(f"🔧 Setup Error: {str(e)}")
            return False
    return False


def save_interview_session(user_id, company, resume_text, chat_history, feedback):
    db = get_db_connection()
    if db is None:
        return False
    try:
        session_data = {
            "user_id": user_id,
            "company": company,
            "resume_text": resume_text,
            "chat_history": chat_history,
            "feedback": feedback,
            "created_at": datetime.utcnow(),
        }
        result = db.interview_sessions.insert_one(session_data)
        return result.inserted_id is not None
    except Exception as e:
        st.error(f"💾 Error saving interview session: {str(e)}")
        return False


def _ensure_session_id():
    """Ensure a persistent session id exists in Streamlit session state."""
    if "session_id" not in st.session_state or not st.session_state.session_id:
        st.session_state.session_id = str(uuid.uuid4())
    return st.session_state.session_id


def autosave_current_session(completed: bool = False):
    """Upsert the current session into `interview_sessions` as a draft.

    This saves `chat_history` and other metadata on every message so users
    can resume if their Streamlit session is interrupted.
    """
    db = get_db_connection()
    if db is None:
        return False

    session_id = _ensure_session_id()
    try:
        session_data = {
            "session_id": session_id,
            "user_id": st.session_state.user_id,
            "company": st.session_state.company,
            "resume_text": st.session_state.pdf_text,
            "chat_history": st.session_state.chat_history,
            "feedback": "\n".join(
                [
                    m["content"]
                    for m in st.session_state.chat_history
                    if m["role"] == "assistant"
                ]
            ),
            "completed": bool(completed or st.session_state.interview_complete),
            "last_updated": datetime.utcnow(),
        }

        # Use upsert with created_at set only on insert
        update = {
            "$set": session_data,
            "$setOnInsert": {"created_at": datetime.utcnow()},
        }
        db.interview_sessions.update_one(
            {"session_id": session_id}, update, upsert=True
        )
        return True
    except Exception as e:
        st.error(f"💾 Autosave error: {str(e)}")
        return False


def finalize_session_from_session_state():
    """Mark the current session as completed and set completed_at/feedback."""
    db = get_db_connection()
    if db is None:
        return False
    session_id = st.session_state.get("session_id")
    if not session_id:
        return save_interview_session(
            st.session_state.user_id,
            st.session_state.company,
            st.session_state.pdf_text,
            st.session_state.chat_history,
            "\n".join(
                [
                    m["content"]
                    for m in st.session_state.chat_history
                    if m["role"] == "assistant"
                ]
            ),
        )
    try:
        feedback = "\n".join(
            [
                m["content"]
                for m in st.session_state.chat_history
                if m["role"] == "assistant"
            ]
        )
        update = {
            "$set": {
                "completed": True,
                "completed_at": datetime.utcnow(),
                "feedback": feedback,
                "last_updated": datetime.utcnow(),
            }
        }
        db.interview_sessions.update_one({"session_id": session_id}, update)
        return True
    except Exception as e:
        st.error(f"💾 Finalize session error: {str(e)}")
        return False


def save_user_resume(user_id, pdf_bytes, resume_text=None):
    """Save the uploaded resume PDF bytes into the user's document.

    Stores as BSON Binary under `resume_pdf` and also updates `resume_text`.
    """
    db = get_db_connection()
    if db is None:
        return False

    # Convert user_id string back to ObjectId when possible
    try:
        uid = ObjectId(user_id) if isinstance(user_id, str) else user_id
    except Exception:
        uid = user_id

    try:
        update = {
            "$set": {
                "resume_pdf": Binary(pdf_bytes),
                "resume_uploaded_at": datetime.utcnow(),
            }
        }
        if resume_text:
            update["$set"]["resume_text"] = resume_text

        result = db.users.update_one({"_id": uid}, update)
        return result.modified_count > 0
    except Exception as e:
        st.error(f"💾 Error saving resume to user profile: {str(e)}")
        return False


def get_user_resume(user_id):
    """Retrieve the resume PDF bytes for a given user id from the DB.

    Returns bytes or None.
    """
    db = get_db_connection()
    if db is None:
        return None

    try:
        try:
            uid = ObjectId(user_id) if isinstance(user_id, str) else user_id
        except Exception:
            uid = user_id

        doc = db.users.find_one({"_id": uid}, {"resume_pdf": 1})
        if doc and doc.get("resume_pdf"):
            # Binary -> bytes
            return bytes(doc.get("resume_pdf"))
        return None
    except Exception as e:
        st.error(f"💾 Error fetching resume from DB: {str(e)}")
        return None


if not init_db():
    st.warning(
        "⚠️ Database not configured. Please set MONGO_URI in secrets.toml or environment variables to enable user authentication."
    )
    st.info(
        """
        To use this app with authentication:
        1. Create a `.streamlit/secrets.toml` file in the project directory
        2. Add your MongoDB connection string:
           ```
           MONGO_URI = "your-mongodb-connection-string"
           DB_NAME = "MockInterviews"
           GROQ_API_KEY = "your-groq-api-key"
           ```
        """
    )
    st.stop()


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def create_user(email, password, full_name):
    db = get_db_connection()
    if db is None:
        return False

    try:
        user_data = {
            "email": email,
            "password": hash_password(password),
            "full_name": full_name,
            "created_at": datetime.utcnow(),
        }
        result = db.users.insert_one(user_data)
        return result.inserted_id is not None
    except DuplicateKeyError:
        st.error("📧 Email already exists. Please use a different email.")
        return False
    except Exception as e:
        st.error(f"❌ Error: {str(e)}")
        return False


def verify_user(email, password):
    db = get_db_connection()
    if db is None:
        return None

    try:
        user = db.users.find_one({"email": email, "password": hash_password(password)})
        return user
    except Exception as e:
        st.error(f"🔐 Error: {str(e)}")
        return None


def process_pdf(file):
    try:
        with pdfplumber.open(file) as pdf:
            text = "\n".join(
                [page.extract_text() for page in pdf.pages if page.extract_text()]
            )
        return text if len(text) > 100 else None
    except Exception as e:
        st.error(f"📄 Error processing PDF: {str(e)}")
        return None


if not st.session_state.logged_in:
    st.markdown(
        """
    <div class="header">
        <h1>🚀 FastTrackHire</h1>
        <p>Your AI-powered interview coach</p>
    </div>
    """,
        unsafe_allow_html=True,
    )

    # Hero box: show the active auth action title inside a prominent box
    hero_title = (
        "🔒 Login"
        if st.session_state.show_login
        else ("✨ Create Account" if st.session_state.show_signup else "Welcome")
    )
    st.markdown(
        f"""
    <div class="hero-box">
        <h2>{hero_title}</h2>
    </div>
    """,
        unsafe_allow_html=True,
    )

    col1, col2 = st.columns([1, 1], gap="large")

    # Login
    with col1:
        if st.session_state.show_login:
            with st.container():
                st.markdown('<div class="card fade-in">', unsafe_allow_html=True)
                # Title is now shown in the hero box above; form renders here

                with st.form("login_form"):
                    email = st.text_input(
                        "Email", key="login_email", placeholder="your.email@example.com"
                    )
                    password = st.text_input(
                        "Password",
                        type="password",
                        key="login_password",
                        placeholder="••••••••",
                    )

                    if st.form_submit_button("Login", type="primary"):
                        user = verify_user(email, password)
                        if user:
                            st.session_state.logged_in = True
                            st.session_state.user_id = str(user["_id"])
                            st.session_state.user_email = user["email"]
                            st.session_state.full_name = user["full_name"]
                            st.rerun()
                        else:
                            st.error("Invalid email or password")

                if st.button("Create an Account", key="signup_button"):
                    st.session_state.show_login = False
                    st.session_state.show_signup = True
                    st.rerun()

                st.markdown("</div>", unsafe_allow_html=True)

    # Signup
    with col2:
        if st.session_state.show_signup:
            with st.container():
                st.markdown('<div class="card fade-in">', unsafe_allow_html=True)
                # Title is now shown in the hero box above; signup form renders here

                with st.form("signup_form"):
                    email = st.text_input(
                        "Email",
                        key="signup_email",
                        placeholder="your.email@example.com",
                    )
                    password = st.text_input(
                        "Password",
                        type="password",
                        key="signup_password",
                        placeholder="••••••••",
                    )
                    confirm_password = st.text_input(
                        "Confirm Password",
                        type="password",
                        key="signup_confirm",
                        placeholder="••••••••",
                    )
                    full_name = st.text_input(
                        "Full Name", key="signup_name", placeholder="Bob"
                    )

                    if st.form_submit_button("Sign Up", type="primary"):
                        if password != confirm_password:
                            st.error("Passwords don't match")
                        elif not all([email, password, full_name]):
                            st.error("All fields are required")
                        else:
                            if create_user(email, password, full_name):
                                st.success(
                                    "Account created successfully! Please login."
                                )
                                st.session_state.show_signup = False
                                st.session_state.show_login = True
                                st.rerun()

                if st.button("Back to Login", key="back_to_login"):
                    st.session_state.show_signup = False
                    st.session_state.show_login = True
                    st.rerun()

                st.markdown("</div>", unsafe_allow_html=True)

    st.stop()

# Main Application  will be loaded after Login

# Sidebar for taking inputs(i.e Resume,Target Company)
with st.sidebar:
    st.markdown(
        f"""
    <div class="sidebar-profile">
        <div class="sidebar-profile-avatar">
            {st.session_state.full_name[0].upper() if st.session_state.full_name else "?"}
        </div>
        <h3>{st.session_state.full_name}</h3>
        <p style="color: rgba(255,255,255,0.7);">{st.session_state.user_email}</p>
    </div>
    """,
        unsafe_allow_html=True,
    )

    if st.button("🚪 Logout", use_container_width=True, type="secondary"):
        try:
            autosave_current_session()
        except Exception:
            pass
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        init_session_state()
        st.rerun()

    st.markdown("---")
    st.markdown("### 🛠️ Interview Setup")

    uploaded_file = st.file_uploader(
        "📄 Upload Resume (PDF)", type="pdf", key="resume_upload"
    )
    if uploaded_file and not st.session_state.resume_uploaded:
        with st.spinner("🔍 Analyzing resume..."):
            try:
                file_bytes = uploaded_file.read()
                # Persist raw bytes in session so user can download immediately
                st.session_state.resume_bytes = file_bytes
                processed_text = process_pdf(io.BytesIO(file_bytes))
                if processed_text:
                    st.session_state.pdf_text = processed_text
                    st.session_state.resume_uploaded = True
                    # store original filename when uploading
                    try:
                        st.session_state.resume_filename = getattr(
                            uploaded_file, "name", "resume.pdf"
                        )
                    except Exception:
                        st.session_state.resume_filename = "resume.pdf"
                    st.success("✅ Resume processed successfully!")
                    # Save PDF bytes into user's profile in DB
                    try:
                        if st.session_state.user_id:
                            saved = save_user_resume(
                                st.session_state.user_id, file_bytes, processed_text
                            )
                            if saved:
                                st.info("📁 Resume saved to your profile.")
                    except Exception as e:
                        st.error(f"Error saving resume to profile: {str(e)}")
            except Exception as e:
                st.error(f"📄 Error analyzing resume: {str(e)}")

    company = st.selectbox(
        "🏢 Select Target Company",
        [
            "Select a company",
            "Google",
            "Amazon",
            "Microsoft",
            "Apple",
            "Meta",
            "Netflix",
            "Other",
        ],
        key="company_select",
    )
    if company != "Select a company":
        st.session_state.company = company

    # Interview Instructions in the side bar
    st.markdown(
        """
    <div class="instructions-card fade-in">
        <h4>📋 Interview Instructions</h4>
        <ul style="margin: 0; padding-left: 1.2rem;">
            <li>Upload your resume in PDF format.</li>
            <li>Select a target company to tailor the interview.</li>
            <li>Answer one question at a time in the chat below.</li>
            <li>Type "Hello" or "Let's Start" to start the interview.</li>
            <li>Say "I don't know" to skip a question.</li>
            <li>Complete all the questions to get recorded for overall performance.</li>
            <li>At the end, request feedback to receive a summary.</li>
        </ul>
    </div>
    """,
        unsafe_allow_html=True,
    )

    # Sidebar Footer
    st.markdown(
        """
    <div class="sidebar-footer">
        <div class="sidebar-footer-disclaimer">
            <strong>⚠️ Educational Purpose Only</strong><br>
            This platform is designed solely for educational and practice purposes. 
            The mock interviews conducted here are simulated experiences and do not represent 
            actual hiring decisions or real company evaluations. Results and feedback are 
            generated by AI for learning purposes only.
        </div>
        <div class="sidebar-footer-copyright">
            © 2025 FastTrackHire. All rights reserved.
        </div>
    </div>
    """,
        unsafe_allow_html=True,
    )

# Main Content Area i.e Chat Interface for Interview
st.markdown(
    """
<div class="header">
    <h1>👨‍💻 FastTrackHire</h1>
    <p>Fast-track your hiring process with AI-powered mock interviews.</p>
</div>
""",
    unsafe_allow_html=True,
)

# Chat Interface contains user input and chat history
chat_container = st.container()
with chat_container:
    st.markdown('<div class="chat-container">', unsafe_allow_html=True)
    for message in st.session_state.chat_history:
        if message["role"] == "user":
            st.markdown(
                f"""
            <div class="user-bubble">
                <span class="chat-icon">🧑</span>
                <span>{message["content"]}</span>
            </div>
            """,
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                f"""
            <div class="assistant-bubble">
                <span class="chat-icon">🤖</span>
                <span>{message["content"]}</span>
            </div>
            """,
                unsafe_allow_html=True,
            )
    st.markdown("</div>", unsafe_allow_html=True)

# Input will be taken here
if st.session_state.resume_uploaded and st.session_state.company != "Select a company":
    user_input = st.chat_input("💬 Type your response here...", key="chat_input")

    if user_input:
        st.session_state.chat_history.append({"role": "user", "content": user_input})
        # Autosave after user message so drafts are persisted
        try:
            autosave_current_session()
        except Exception:
            pass
        st.session_state.question_count += 1

        if (
            st.session_state.chat_history
            and st.session_state.chat_history[-1]["role"] == "user"
            and not st.session_state.interview_complete
        ):
            prompt = f"""
You are an interviewer from **{st.session_state.company}** conducting a technical interview.

## Candidate Resume:
{st.session_state.pdf_text}

---

**Instructions:**
Only give the feedback after the interview if the candidate ask the feedback before completion tell that you need to complete the interview to give the feedback.

1. Greet the candidate by name, extracted from the resume.
2. Start the interview by asking **3 DSA questions** at the level typically asked by {st.session_state.company}, focusing on the most commonly asked DSA problems by the {st.session_state.company} and make sure the questions must be medium-hard.
3. Ask **only one question at a time**, waiting for the candidate's response before proceeding to the next and if candidate's response is like I don't know skip to next question.
4. After the DSA questions, ask **3 to 4 very in-depth questions based on the candidate's resume**.
5. Once all questions are completed, provide a **summary feedback**, including:
   - Overall performance
   - Strengths
   - Areas for improvement
   
6. Maintain a natural, conversational style as if you are an actual {st.session_state.company} interviewer.

**Do not** ask multiple questions in one turn.

---
"""
            try:
                # Get GROQ API key from secrets or environment
                groq_api_key = None
                try:
                    groq_api_key = st.secrets.get("GROQ_API_KEY")
                except Exception:
                    pass

                if not groq_api_key:
                    groq_api_key = os.getenv("GROQ_API_KEY")

                if not groq_api_key:
                    st.error(
                        "❌ GROQ_API_KEY not found. Please add it to secrets.toml or environment variables."
                    )
                    st.stop()

                groq_client = Groq(api_key=groq_api_key)
                response = groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": prompt},
                        *[
                            {"role": msg["role"], "content": msg["content"]}
                            for msg in st.session_state.chat_history
                        ],
                    ],
                    temperature=0.7,
                )
                ai_response = response.choices[0].message.content

                # Check if interview is complete (contains selection-related phrases)
                if any(
                    phrase in ai_response.lower()
                    for phrase in ["you are selected", "not selected"]
                ):
                    st.session_state.interview_complete = True
                    # Finalize the session in DB (mark completed)
                    try:
                        finalize_session_from_session_state()
                    except Exception:
                        # fallback to legacy save
                        try:
                            feedback = "\n".join(
                                [
                                    msg["content"]
                                    for msg in st.session_state.chat_history
                                    if msg["role"] == "assistant"
                                ]
                            )
                            save_interview_session(
                                st.session_state.user_id,
                                st.session_state.company,
                                st.session_state.pdf_text,
                                st.session_state.chat_history,
                                feedback,
                            )
                        except Exception:
                            pass

                st.session_state.chat_history.append(
                    {"role": "assistant", "content": ai_response}
                )
                # Autosave after assistant response
                try:
                    autosave_current_session()
                except Exception:
                    pass
                st.rerun()

            except Exception as e:
                st.error(f"🤖 Error generating response: {str(e)}")
else:
    st.warning(
        "⚠️ Please upload your resume in the sidebar and select a company to start the interview.",
        icon="⚠️",
    )
