from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
import uuid
import enum

def generate_uuid():
    return str(uuid.uuid4())

class Topic(Base):
    __tablename__ = "topics"
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    teacher_id = Column(String, nullable=False)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ApplicationStatus(enum.Enum):
    CREATED = "created"
    STUDENT_CONFIRMED = "student_confirmed"
    TEACHER_CONFIRMED = "teacher_confirmed"
    APPROVED = "approved"
    REJECTED = "rejected"

class Application(Base):
    __tablename__ = "applications"
    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, nullable=False)
    topic_id = Column(String, ForeignKey("topics.id"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.CREATED)
    student_code = Column(String(10), nullable=False)
    teacher_code = Column(String(10), nullable=False)
    student_confirmed_at = Column(DateTime(timezone=True), nullable=True)
    teacher_confirmed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    topic = relationship("Topic")