from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_uuid: str
    course_id: int
    filename: str
    characters: int
    chunks_created: int
    created_at: datetime