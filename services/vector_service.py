
import os
import uuid

import chromadb
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Initialize OpenAI
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize persistent ChromaDB storage
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Create or retrieve collection
collection = chroma_client.get_or_create_collection(
    name="study_materials",
    metadata={"hnsw:space": "cosine"}
)


def split_text(text, chunk_size=800, overlap=150):
    """Split document text into overlapping chunks."""

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


def add_document(
    text,
    filename,
    document_uuid=None,
    course_id=None
):
    """Create embeddings and store course-specific document chunks."""

    chunks = split_text(text)

    if not chunks:
        raise ValueError("No text available to store.")

    # Generate a unique document identifier if one isn't supplied
    if document_uuid is None:
        document_uuid = str(uuid.uuid4())

    # Delete previous chunks belonging to this document
    collection.delete(
        where={"document_uuid": document_uuid}
    )

    # Generate embeddings
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=chunks
    )

    embeddings = [
        item.embedding for item in response.data
    ]

    # Generate unique IDs for individual chunks
    ids = [str(uuid.uuid4()) for _ in chunks]

    # Store document metadata
    metadata = {
        "filename": filename,
        "document_uuid": document_uuid
    }

    if course_id is not None:
        metadata["course_id"] = course_id

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=[
            metadata.copy() for _ in chunks
        ]
    )

    return {
        "filename": filename,
        "document_uuid": document_uuid,
        "course_id": course_id,
        "chunks_created": len(chunks)
    }


def delete_document(document_uuid):
    """Delete all ChromaDB chunks belonging to a document."""

    collection.delete(
        where={"document_uuid": document_uuid}
    )


def search_documents(question, course_id=None, n_results=4):
    """Find relevant chunks, optionally restricted to a course."""

    if collection.count() == 0:
        return []

    # Generate question embedding
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=question
    )

    query_embedding = response.data[0].embedding

    # Restrict retrieval to a particular course when requested
    search_filter = None

    if course_id is not None:
        search_filter = {"course_id": course_id}

    query_options = {
        "query_embeddings": [query_embedding],
        "n_results": min(n_results, collection.count()),
        "include": ["documents", "metadatas", "distances"]
    }

    if search_filter is not None:
        query_options["where"] = search_filter

    results = collection.query(**query_options)

    matches = []

    if not results["documents"] or not results["documents"][0]:
        return []

    for i, document in enumerate(results["documents"][0]):
        metadata = results["metadatas"][0][i]

        matches.append({
            "text": document,
            "filename": metadata["filename"],
            "document_uuid": metadata.get("document_uuid"),
            "course_id": metadata.get("course_id"),
            "distance": results["distances"][0][i]
        })

    return matches
