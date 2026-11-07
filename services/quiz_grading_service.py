
def grade_quiz(quiz, submitted_answers):
    """
    Grade a student's quiz submission.
    """

    questions = quiz.questions
    total_questions = len(questions)

    expected_numbers = set(range(1, total_questions + 1))
    submitted_numbers = set(submitted_answers.keys())

    if submitted_numbers != expected_numbers:
        raise ValueError(
            "You must submit exactly one answer for every question."
        )

    correct_count = 0
    results = []

    for index, question in enumerate(questions):
        question_number = index + 1

        correct_answer = question["correct_answer"]
        student_answer = submitted_answers[question_number]

        if student_answer not in question["options"]:
            raise ValueError(
                f"Invalid answer for question {question_number}."
            )

        is_correct = student_answer == correct_answer

        if is_correct:
            correct_count += 1

        results.append({
            "question_number": question_number,
            "question": question["question"],
            "student_answer": student_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "explanation": question["explanation"]
        })

    score_percentage = round(
        (correct_count / total_questions) * 100
    )

    return {
        "quiz_id": quiz.id,
        "total_questions": total_questions,
        "correct_answers": correct_count,
        "incorrect_answers": total_questions - correct_count,
        "score_percentage": score_percentage,
        "results": results
    }
