
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from models.document import Document
from models.conversation import Conversation
from models.message import Message
from models.quiz import Quiz

# API routers
from routers.documents import router as documents_router
from routers.conversations import router as conversations_router
from routers.courses import router as courses_router
from routers.quizzes import router as quizzes_router

# Application services
from services.study_service import ask_ai
from services.pdf_service import extract_text_from_pdf
from services.notes_service import save_notes
from services.vector_service import add_document

import os
import shutil

load_dotenv()

app = FastAPI()

# Allow the React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(courses_router)
app.include_router(documents_router)
app.include_router(conversations_router)
app.include_router(quizzes_router)


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def root():
    return {
        "message": "AI Study Assistant Running"
    }


@app.post("/ask")
def ask(request: QuestionRequest):
    answer = ask_ai(request.question)

    return {
        "question": request.question,
        "response": answer
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join("uploads", file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text_from_pdf(file_path)

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="No readable text found in PDF."
        )

    save_notes(text)

    document_info = add_document(text, file.filename)

    return {
        "filename": file.filename,
        "characters": len(text),
        "chunks_created": document_info["chunks_created"],
        "message": "PDF uploaded and indexed successfully."
    }
