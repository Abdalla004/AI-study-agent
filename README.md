# StudyAI – AI-Powered Learning Platform

StudyAI is an AI-powered learning platform designed to help students understand their course materials through document-based AI tutoring, intelligent retrieval, and interactive study tools.

Students can upload course PDFs, organize materials by course, ask questions about their documents, and receive contextual explanations powered by OpenAI.

## Features

- **PDF Uploads:** Upload course documents and extract readable text.
- **AI-Powered Tutoring:** Ask questions and receive beginner-friendly explanations.
- **Retrieval-Augmented Generation (RAG):** Retrieve relevant document passages to provide context for AI-generated answers.
- **Course-Specific Retrieval:** Restrict document searches to the selected course.
- **Vector Search:** Store and retrieve document embeddings using ChromaDB.
- **Conversation History:** Use previous messages to provide context for follow-up questions.
- **Quiz Management:** Dedicated quiz API and grading services.
- **Persistent Storage:** Use PostgreSQL for application data and ChromaDB for vector storage.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL, SQLAlchemy |
| Vector Database | ChromaDB |
| AI Models | OpenAI GPT-4.1-mini, text-embedding-3-small |
| Document Processing | pypdf |
| Infrastructure | Docker, Docker Compose |

## Architecture

1. Students interact with the React frontend.
2. FastAPI handles API requests and application logic.
3. PDF files are processed using pypdf.
4. Extracted text is divided into overlapping chunks.
5. OpenAI generates embeddings for each chunk.
6. ChromaDB stores document chunks, embeddings, and metadata.
7. When a student asks a question, the system generates a query embedding.
8. ChromaDB retrieves relevant document passages.
9. Retrieved context and conversation history are passed to GPT-4.1-mini.
10. The AI generates a contextual response.

## Project Structure

```text
study-ai-agent/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── models/
├── routers/
├── schemas/
├── services/
│   ├── pdf_service.py
│   ├── study_service.py
│   ├── vector_service.py
│   ├── notes_service.py
│   ├── quiz_service.py
│   └── quiz_grading_service.py
├── database.py
├── docker-compose.yml
├── main.py
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Python
- Node.js and npm
- Docker Desktop
- OpenAI API key

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-study-agent.git
cd ai-study-agent
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Add your own PostgreSQL password, database connection string, and OpenAI API key to `.env`.

Never commit your `.env` file.

### 3. Start PostgreSQL

```bash
docker compose up -d db
```

### 4. Start the backend

Install the Python dependencies required by the project, then run:

```bash
uvicorn main:app --reload
```

The API will be available at:

`http://localhost:8000`

FastAPI documentation:

`http://localhost:8000/docs`

### 5. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

`http://localhost:5173`

## Environment Variables

See `.env.example` for the required configuration.

- `OPENAI_API_KEY`
- `DATABASE_URL`
- `POSTGRES_PASSWORD`

## Future Improvements

- Automated deployment pipeline using GitHub Actions.
- Cloud deployment and managed database infrastructure.
- Authentication and user-specific study environments.
- Improved document management and study analytics.
- Expanded AI-generated practice questions and learning assessments.

## Author

Abdalla Mohamed

Developed as a full-stack AI application exploring retrieval-augmented generation, vector databases, backend API development, and modern frontend engineering.
