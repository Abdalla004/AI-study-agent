
const API_BASE_URL = "http://127.0.0.1:8000";

// Course data
export interface Course {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

// Document data
export interface Document {
  id: number;
  document_uuid: string;
  course_id: number;
  filename: string;
  characters: number;
  chunks_created: number;
  created_at: string;
}

// Conversation data
export interface Conversation {
  id: number;
  course_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

// Message data
export interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  sources: string[] | null;
  created_at: string;
}

// Quiz data
export interface QuizQuestion {
  question_number: number;
  question: string;
  options: string[];
}

export interface GeneratedQuiz {
  quiz_id: number;
  course_id: number;
  difficulty: string;
  question_count: number;
  questions: {
    question: string;
    options: string[];
  }[];
  sources: string[];
  created_at: string;
}

export interface QuizSummary {
  quiz_id: number;
  course_id: number;
  difficulty: string;
  question_count: number;
  sources: string[];
  created_at: string;
}

export interface QuizDetails {
  quiz_id: number;
  course_id: number;
  difficulty: string;
  question_count: number;
  sources: string[];
  questions: QuizQuestion[];
}

export interface QuizResultItem {
  question_number: number;
  question: string;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

export interface QuizResult {
  quiz_id: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  score_percentage: number;
  results: QuizResultItem[];
}

// Get all courses
export async function getCourses(): Promise<Course[]> {
  const response = await fetch(`${API_BASE_URL}/courses/`);

  if (!response.ok) {
    throw new Error("Could not load courses.");
  }

  return response.json();
}

// Get documents belonging to a course
export async function getDocuments(
  courseId: number
): Promise<Document[]> {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/documents`
  );

  if (!response.ok) {
    throw new Error("Could not load documents.");
  }

  return response.json();
}

// Upload a PDF to a course
export async function uploadDocument(
  courseId: number,
  file: File
): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/documents`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Could not upload document.");
  }

  return response.json();
}

// Delete a document
export async function deleteDocument(
  courseId: number,
  documentId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/documents/${documentId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Could not delete document.");
  }
}

// Generate a quiz
export async function generateQuiz(
  courseId: number,
  difficulty: "easy" | "medium" | "hard",
  questionCount: number
): Promise<GeneratedQuiz> {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/quizzes/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        difficulty,
        question_count: questionCount,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Could not generate quiz.");
  }

  return response.json();
}

// Get quizzes for a course
export async function getQuizzes(
  courseId: number
): Promise<QuizSummary[]> {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/quizzes`
  );

  if (!response.ok) {
    throw new Error("Could not load quizzes.");
  }

  return response.json();
}

// Get an individual quiz
export async function getQuiz(
  quizId: number
): Promise<QuizDetails> {
  const response = await fetch(
    `${API_BASE_URL}/quizzes/${quizId}`
  );

  if (!response.ok) {
    throw new Error("Could not load quiz.");
  }

  return response.json();
}

// Submit quiz answers
export async function submitQuiz(
  quizId: number,
  answers: Record<number, string>
): Promise<QuizResult> {
  const response = await fetch(
    `${API_BASE_URL}/quizzes/${quizId}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Could not submit quiz.");
  }

  return response.json();
}

// Create a new conversation
export async function createConversation(
  courseId: number,
  title: string
): Promise<Conversation> {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/conversations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    }
  );

  if (!response.ok) {
    throw new Error("Could not create conversation.");
  }

  return response.json();
}

// Get conversation history for a course
export async function getConversations(
  courseId: number
): Promise<Conversation[]> {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/conversations`
  );

  if (!response.ok) {
    throw new Error("Could not load conversation history.");
  }

  return response.json();
}

// Send a message and receive the updated conversation
export async function sendMessage(
  conversationId: number,
  content: string
): Promise<Message[]> {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok) {
    throw new Error("Could not send message.");
  }

  return response.json();
}

// Get messages from an existing conversation
export async function getMessages(
  conversationId: number
): Promise<Message[]> {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/messages`
  );

  if (!response.ok) {
    throw new Error("Could not load conversation history.");
  }

  return response.json();
}
