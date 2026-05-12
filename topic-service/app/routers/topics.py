from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from ..database import get_db
from ..models import Topic, Application, ApplicationStatus
from ..schemas import TopicCreate, TopicResponse, ApplicationCreate, ApplicationResponse
from shared.jwt_utils import get_current_user
import random
import string

router = APIRouter(prefix="/api/topic", tags=["topics"])

def generate_code():
    return ''.join(random.choices(string.digits, k=6))

@router.post("/teachers/me/topics", response_model=TopicResponse)
def create_topic(
    topic_data: TopicCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.get("role") != "teacher":
        raise HTTPException(status_code=403, detail="Только преподаватель может создавать темы")
    new_topic = Topic(
        title=topic_data.title,
        description=topic_data.description,
        teacher_id=current_user.get("id")
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic

@router.get("/topics", response_model=list[TopicResponse])
def list_topics(db: Session = Depends(get_db)):
    topics = db.query(Topic).filter(Topic.status == "active").all()
    return topics

@router.get("/topics/{topic_id}", response_model=TopicResponse)
def get_topic(topic_id: str, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")
    return topic

@router.post("/applications", response_model=ApplicationResponse)
def create_application(
    app_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Только студент может подавать заявку")
    topic = db.query(Topic).filter(Topic.id == app_data.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")
    existing = db.query(Application).filter(
        Application.topic_id == app_data.topic_id,
        Application.status != ApplicationStatus.REJECTED
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="На эту тему уже подана заявка")
    student_code = generate_code()
    teacher_code = generate_code()
    new_app = Application(
        student_id=current_user.get("id"),
        topic_id=app_data.topic_id,
        student_code=student_code,
        teacher_code=teacher_code
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.post("/confirm")
def confirm_code(
    application_id: str,
    code: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    role = current_user.get("role")
    if role == "student":
        if app.student_code != code:
            raise HTTPException(status_code=400, detail="Неверный код")
        app.status = ApplicationStatus.STUDENT_CONFIRMED
        app.student_confirmed_at = func.now()
    elif role == "teacher":
        if app.teacher_code != code:
            raise HTTPException(status_code=400, detail="Неверный код")
        app.status = ApplicationStatus.TEACHER_CONFIRMED
        app.teacher_confirmed_at = func.now()
    else:
        raise HTTPException(status_code=403, detail="Нет прав")
    db.commit()
    return {"message": "Код подтверждён", "status": app.status.value}