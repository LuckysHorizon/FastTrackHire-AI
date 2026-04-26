# FastTrackHire - System & Application Details

## System Overview
**FastTrackHire** is an AI-powered mock interview web application designed to help users simulate company-specific technical interviews. It analyzes the user's resume and tailors questions accordingly, using advanced Large Language Models (LLMs). The application is built with Python and Streamlit, utilizing MongoDB for data persistence and Groq's API for AI inference.

## Key Features

### 1. User Authentication & Profile Management
- **Secure Login/Signup:** Users can create an account using their email and password (passwords are hashed using SHA-256 before being stored in MongoDB).
- **Session Management:** The system maintains user sessions, keeping them logged in and persisting their current mock interview progress.

### 2. Resume Parsing & Storage
- **PDF Upload:** Users can upload their resumes in PDF format.
- **Text Extraction:** Uses `pdfplumber` to extract text from the uploaded resume to feed context to the LLM.
- **Resume Persistence:** Saves the raw PDF binary and the extracted text directly into the user's profile in the MongoDB database, allowing for preview and download anytime.

### 3. AI-Powered Mock Interviews
- **Company Selection:** Users can choose from top tech companies (Google, Amazon, Microsoft, Apple, Meta, Netflix, etc.) to tailor the difficulty and focus of the interview.
- **Structured Interview Flow:** 
  - The AI interviewer greets the user by name.
  - Asks **3 Data Structures and Algorithms (DSA) questions** specifically modeled after the selected company's typical medium-hard difficulty.
  - Follows up with **3-4 in-depth questions based on the candidate's resume/CV**.
- **Interactive Chat:** Provides a conversational chat interface with dynamic user and assistant message bubbles. Ensures the AI asks only one question at a time.

### 4. Real-time Autosave & Session State
- **Draft Sessions:** Interview progress is autosaved to MongoDB after every user and assistant message. If the app reloads, the session is preserved.
- **Chat History Management:** Manages message history efficiently, rendering the ongoing conversation directly within the Streamlit container.

### 5. Automated Feedback & Evaluation
- **Performance Summary:** Once the interview is complete, the AI provides a comprehensive summary of the user's performance.
- **Strengths & Weaknesses:** Outlines the user's strengths and points out specific areas for improvement.
- **Completed Sessions:** Marks the session as completed in the database once the feedback is successfully generated.

## Technical Stack
- **Frontend & App Framework:** [Streamlit](https://streamlit.io/) for building the interactive UI and chat interface.
- **Programming Language:** Python 3
- **Database:** MongoDB (via `pymongo`) for storing user credentials, resumes, and interview histories.
- **AI / LLM Provider:** [Groq API](https://groq.com/) using the `llama-3.1-8b-instant` model for generating high-speed, intelligent interviewer responses.
- **PDF Processing:** `pdfplumber` for robust text extraction.
- **Environment Management:** `python-dotenv` for securely loading API keys (`MONGO_URI`, `GROQ_API_KEY`).

## Application Workflow
1. **Onboarding:** The user creates an account or logs in.
2. **Setup:** The user uploads a PDF resume and selects a target company from the sidebar.
3. **Execution:** The user starts the chat. The AI reads the system prompt (which includes the resume text and company name) and begins the technical interview.
4. **Completion:** After completing the DSA and resume-based questions, the LLM provides final feedback, and the session is marked as finalized.
