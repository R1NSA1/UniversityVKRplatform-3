from pydantic import BaseModel
from typing import Optional

class TopicCreate(BaseModel):
    title: str
    description: Optional[str] = None

class TopicResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    teacher_id: str
    status: str
    created_at: str

class ApplicationCreate(BaseModel):
    topic_id: str

class ApplicationResponse(BaseModel):
    id: str
    student_id: str
    topic_id: str
    status: str
    student_code: Optional[str] = None
    teacher_code: Optional[str] = None