
from pydantic import BaseModel, Field
from typing import Literal


class QuizGenerateRequest(BaseModel):
    question_count: int = Field(default=5, ge=5, le=20)
    difficulty: Literal["easy", "medium", "hard"] = "medium"


class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct_answer: str
    explanation: str


class QuizResponse(BaseModel):
    course_id: int
    difficulty: str
    questions: list[QuizQuestion]

class QuizSubmissionRequest(BaseModel):
    answers: dict[int, str]
