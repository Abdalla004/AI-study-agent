
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    JSON,
    func
)

from database import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)

    course_id = Column(
        Integer,
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    difficulty = Column(String(20), nullable=False)

    question_count = Column(Integer, nullable=False)

    questions = Column(JSON, nullable=False)

    sources = Column(
        JSON,
        nullable=False,
        default=list
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
