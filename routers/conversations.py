
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.course import Course
from models.conversation import Conversation
from models.message import Message
from schemas.conversation import (
    ConversationCreate,
    ConversationResponse
)
from schemas.message import MessageCreate, MessageResponse
from services.study_service import ask_ai

router = APIRouter(
    tags=["Conversations"]
)


# Create a conversation inside a course
@router.post(
    "/courses/{course_id}/conversations",
    response_model=ConversationResponse,
    status_code=201
)
def create_conversation(
    course_id: int,
    request: ConversationCreate,
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

    conversation = Conversation(
        course_id=course_id,
        title=request.title
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


# Retrieve conversations belonging to a course
@router.get(
    "/courses/{course_id}/conversations",
    response_model=list[ConversationResponse]
)
def get_conversations(
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

    return db.query(Conversation).filter(
        Conversation.course_id == course_id
    ).order_by(Conversation.created_at.desc()).all()


# Send a message and receive an AI response
@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=list[MessageResponse]
)
def send_message(
    conversation_id: int,
    request: MessageCreate,
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found."
        )

    # Retrieve the previous 20 messages BEFORE saving the new question
    previous_history = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(
        Message.created_at.desc(),
        Message.id.desc()
    ).limit(20).all()

    # Reverse messages to restore chronological order
    previous_history.reverse()

    # Save the student's new message
    user_message = Message(
        conversation_id=conversation_id,
        role="user",
        content=request.content
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    try:
        # Generate an answer using study materials and conversation history
        result = ask_ai(
            question=request.content,
            course_id=conversation.course_id,
            conversation_history=previous_history
        )

        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=result["answer"],
            sources=result["sources"]
        )

        db.add(assistant_message)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=502,
            detail="The AI tutor could not generate a response."
        )

    # Return all messages in chronological order
    return db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(
        Message.created_at,
        Message.id
    ).all()


# Retrieve all messages in a conversation
@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[MessageResponse]
)
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found."
        )

    return db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(
        Message.created_at,
        Message.id
    ).all()
