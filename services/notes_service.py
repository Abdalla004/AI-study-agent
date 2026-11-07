import os

NOTES_FILE = "uploads/current_notes.txt"


def save_notes(text):
    os.makedirs("uploads", exist_ok=True)

    with open(NOTES_FILE, "w", encoding="utf-8") as file:
        file.write(text)


def get_notes():
    if not os.path.exists(NOTES_FILE):
        return ""

    with open(NOTES_FILE, "r", encoding="utf-8") as file:
        return file.read()