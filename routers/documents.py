
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database import get_db
from models.course import Course
from models.document import Document
from schemas.document import DocumentResponse
from services.pdf_service import extract_text_from_pdf
from services.vector_service import add_document, delete_document

router = APIRouter(
    prefix="/courses",
    tags=["Documents"]
)

UPLOAD_DIR = Path("uploads")
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@router.post(
    "/{course_id}/documents",
    response_model=DocumentResponse,
    status_code=201
)
async def upload_course_document(
    course_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Verify that the course exists
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found."
        )

    # Validate the uploaded file
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    # Generate a unique document identifier
    document_uuid = str(uuid.uuid4())

    # Sanitize the original filename
    safe_filename = Path(file.filename).name

    # Create a course-specific upload directory
    course_directory = UPLOAD_DIR / str(course_id)
    course_directory.mkdir(parents=True, exist_ok=True)

    file_path = course_directory / f"{document_uuid}_{safe_filename}"

    try:
        # Save the PDF and enforce the upload size limit
        total_size = 0

        with open(file_path, "wb") as destination:
            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="PDF exceeds the 20 MB limit."
                    )

                destination.write(chunk)

        # Check that the file is actually a PDF
        with open(file_path, "rb") as uploaded_file:
            if uploaded_file.read(5) != b"%PDF-":
                raise HTTPException(
                    status_code=400,
                    detail="The uploaded file is not a valid PDF."
                )

        # Extract PDF text
        text = extract_text_from_pdf(str(file_path))

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found in PDF."
            )

        # Generate embeddings and index document chunks
        document_info = add_document(
            text=text,
            filename=safe_filename,
            document_uuid=document_uuid,
            course_id=course_id
        )

        # Save document information in PostgreSQL
        new_document = Document(
            document_uuid=document_uuid,
            course_id=course_id,
            filename=safe_filename,
            file_path=str(file_path),
            characters=len(text),
            chunks_created=document_info["chunks_created"]
        )

        db.add(new_document)
        db.commit()
        db.refresh(new_document)

        return new_document

    except HTTPException:
        db.rollback()
        if file_path.exists():
            file_path.unlink()
        raise

    except Exception:
        db.rollback()
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=500,
            detail="Document upload failed. Please try again."
        )

    finally:
        await file.close()


@router.get(
    "/{course_id}/documents",
    response_model=list[DocumentResponse]
)
def get_course_documents(
    course_id: int,
    db: Session = Depends(get_db)
):
    # Verify that the course exists
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found."
        )

    # Retrieve documents belonging to this course
    documents = db.query(Document).filter(
        Document.course_id == course_id
    ).order_by(
        Document.created_at.desc()
    ).all()

    return documents


@router.delete(
    "/{course_id}/documents/{document_id}"
)
def delete_course_document(
    course_id: int,
    document_id: int,
    db: Session = Depends(get_db)
):
    # Find the document within the specified course
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.course_id == course_id
    ).first()

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found in this course."
        )

    try:
        # Remove the document's embeddings from ChromaDB
        delete_document(document.document_uuid)

        # Remove the original PDF file
        file_path = Path(document.file_path)

        if file_path.exists():
            file_path.unlink()

        # Remove the document record from PostgreSQL
        db.delete(document)
        db.commit()

        return {
            "message": "Document deleted successfully.",
            "document_id": document_id
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Document deletion failed. Please try again."
        )
