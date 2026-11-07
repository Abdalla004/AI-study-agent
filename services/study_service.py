
from openai import OpenAI
from dotenv import load_dotenv
import os

from services.vector_service import search_documents

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def ask_ai(question, course_id=None, conversation_history=None):
    """
    Answer a student's question using relevant study materials
    and optional previous conversation history.
    """

    relevant_chunks = search_documents(
        question,
        course_id=course_id
    )

    # Combine retrieved study material
    study_material = "\n\n".join(
        chunk["text"] for chunk in relevant_chunks
    )

    # Collect unique source filenames
    sources = list(dict.fromkeys(
        chunk["filename"] for chunk in relevant_chunks
    ))

    # Format previous conversation history
    history = ""

    if conversation_history:
        history = "\n\n".join(
            f"{message.role.upper()}: {message.content}"
            for message in conversation_history
        )

    prompt = f"""
You are an AI study assistant.

Your job is to help students understand their course materials.

PREVIOUS CONVERSATION:
{history if history else "No previous conversation."}

RETRIEVED STUDY MATERIAL:
{study_material if study_material else "No relevant study material was retrieved."}

STUDENT'S CURRENT QUESTION:
{question}

Instructions:
- Use previous conversation history to understand follow-up questions.
- Understand references such as "the first one", "that concept", and "explain more".
- Base course-specific explanations on the retrieved study material and relevant previous conversation.
- Explain concepts in beginner-friendly language.
- Give examples when helpful.
- If the available context does not contain enough information, clearly say so.
- Do not invent information.
- Organize explanations using headings or bullet points.
"""

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    return {
        "answer": response.output_text,
        "sources": sources
    }
