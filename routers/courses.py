from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database import get_db
from models.course import Course
from schemas.course import CourseCreate, CourseResponse
from services.study_service import ask_ai

router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)


class CourseQuestion(BaseModel):
    question: str = Field(min_length=1, max_length=2000)


@router.post("/", response_model=CourseResponse, status_code=201)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db)
):
    new_course = Course(
        name=course.name,
        description=course.description
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course


@router.get("/", response_model=list[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).order_by(Course.id).all()


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course


@router.post("/{course_id}/ask")
def ask_course_question(
    course_id: int,
    request: CourseQuestion,
    db: Session = Depends(get_db)
):
    # Verify that the course exists
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    # Ask AI using only this course's materials
    result = ask_ai(
        question=request.question,
        course_id=course_id
    )

    return {
        "course_id": course_id,
        "course_name": course.name,
        "question": request.question,
        "answer": result["answer"],
        "sources": result["sources"]
    }