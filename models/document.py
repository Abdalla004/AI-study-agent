import uuid

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func

from database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    document_uuid = Column(
        String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4())
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    filename = Column(String(255), nullable=False)

    file_path = Column(String(500), nullable=False)

    characters = Column(Integer, nullable=False, default=0)

    chunks_created = Column(Integer, nullable=False, default=0)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )