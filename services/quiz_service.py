
import json

from services.vector_service import search_documents
from services.study_service import client


def generate_quiz(course_id, question_count=5, difficulty="medium"):
    """
    Generate a multiple-choice quiz using only retrieved
    course study materials.
    """

    study_materials = search_documents(
        question=(
            "Important course concepts, definitions, "
            "examples, explanations, and key topics."
        ),
        course_id=course_id,
        n_results=10
    )

    if not study_materials:
        raise ValueError(
            "No study materials found for this course. "
            "Upload course documents first."
        )

    context = "\n\n".join(
        chunk["text"] for chunk in study_materials
    )

    prompt = f"""
You are an educational quiz generator.

Your task is to create a quiz using ONLY the provided
study material.

QUIZ REQUIREMENTS:

- Generate exactly {question_count} questions.
- Difficulty: {difficulty}.
- Every question must have exactly four answer options.
- Only one answer must be correct.
- Include an explanation for every question.
- Avoid duplicate questions.
- Test understanding of the provided material.
- Cover different topics when the material supports it.
- Do not repeatedly test the same concept.

STRICT SOURCE RULES:

- Use ONLY facts explicitly supported by the study material.
- Do not introduce outside knowledge.
- Do not invent definitions, examples, or facts.
- Do not assume information that is not provided.
- Every correct answer must be supported by the material.
- Every explanation must be supported by the material.
- If the material does not support enough questions,
  do not invent additional questions.

STUDY MATERIAL:

{context}

Return ONLY valid JSON using this structure:

{{
    "questions": [
        {{
            "question": "Question text",
            "options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            "correct_answer": "Option A",
            "explanation": "Explanation supported by the study material."
        }}
    ]
}}
"""

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt,
        text={
            "format": {
                "type": "json_object"
            }
        }
    )

    try:
        quiz_data = json.loads(response.output_text)
    except json.JSONDecodeError as error:
        raise ValueError(
            "The AI returned invalid quiz data. Please try again."
        ) from error

    questions = quiz_data.get("questions")

    if (
        not isinstance(questions, list)
        or len(questions) != question_count
    ):
        raise ValueError(
            "The AI did not generate the requested number of questions."
        )

    for question in questions:
        if (
            not isinstance(question, dict)
            or not isinstance(question.get("question"), str)
            or not isinstance(question.get("options"), list)
            or len(question["options"]) != 4
            or not all(
                isinstance(option, str)
                for option in question["options"]
            )
            or not isinstance(question.get("correct_answer"), str)
            or question["correct_answer"] not in question["options"]
            or not isinstance(question.get("explanation"), str)
        ):
            raise ValueError(
                "The AI returned an invalid quiz question."
            )

    sources = list(dict.fromkeys(
        chunk["filename"] for chunk in study_materials
    ))

    return {
        "questions": questions,
        "sources": sources
    }
