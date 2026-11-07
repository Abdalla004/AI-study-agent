
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.course import Course
from models.quiz import Quiz
from schemas.quiz import QuizGenerateRequest, QuizSubmissionRequest
from services.quiz_service import generate_quiz
from services.quiz_grading_service import grade_quiz

router = APIRouter(tags=["Quizzes"])


# Generate and save a new quiz
@router.post("/courses/{course_id}/quizzes/generate")
def create_quiz(
    course_id: int,
    request: QuizGenerateRequest,
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found."
        )

    try:
        quiz_data = generate_quiz(
            course_id=course_id,
            question_count=request.question_count,
            difficulty=request.difficulty
        )

        new_quiz = Quiz(
            course_id=course_id,
            difficulty=request.difficulty,
            question_count=len(quiz_data["questions"]),
            questions=quiz_data["questions"],
            sources=quiz_data["sources"]
        )

        db.add(new_quiz)
        db.commit()
        db.refresh(new_quiz)

        return {
            "quiz_id": new_quiz.id,
            "course_id": new_quiz.course_id,
            "difficulty": new_quiz.difficulty,
            "question_count": new_quiz.question_count,
            "questions": new_quiz.questions,
            "sources": new_quiz.sources,
            "created_at": new_quiz.created_at
        }

    except ValueError as error:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=502,
            detail="The AI quiz generator could not generate or save the quiz."
        )


# Retrieve quiz history for a course
@router.get("/courses/{course_id}/quizzes")
def get_course_quizzes(
    course_id: int,
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found."
        )

    quizzes = db.query(Quiz).filter(
        Quiz.course_id == course_id
    ).order_by(Quiz.created_at.desc()).all()

    return [
        {
            "quiz_id": quiz.id,
            "course_id": quiz.course_id,
            "difficulty": quiz.difficulty,
            "question_count": quiz.question_count,
            "sources": quiz.sources or [],
            "created_at": quiz.created_at
        }
        for quiz in quizzes
    ]


# Retrieve an individual quiz without exposing correct answers
@router.get("/quizzes/{quiz_id}")
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id
    ).first()

    if quiz is None:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found."
        )

    student_questions = []

    for index, question in enumerate(quiz.questions):
        student_questions.append({
            "question_number": index + 1,
            "question": question["question"],
            "options": question["options"]
        })

    return {
        "quiz_id": quiz.id,
        "course_id": quiz.course_id,
        "difficulty": quiz.difficulty,
        "question_count": quiz.question_count,
        "sources": quiz.sources or [],
        "questions": student_questions
    }


# Submit and grade a quiz
@router.post("/quizzes/{quiz_id}/submit")
def submit_quiz(
    quiz_id: int,
    request: QuizSubmissionRequest,
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id
    ).first()

    if quiz is None:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found."
        )

    try:
        result = grade_quiz(
            quiz=quiz,
            submitted_answers=request.answers
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
