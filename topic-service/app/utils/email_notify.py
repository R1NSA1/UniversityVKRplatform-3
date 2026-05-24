import logging
import os

import httpx
from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

EMAIL_SERVICE_URL = os.getenv("EMAIL_SERVICE_URL", "http://email-service:8000").rstrip("/")


def get_user_email(db: Session, user_id: str) -> str | None:
    row = db.execute(
        text("SELECT email FROM users WHERE id::text = :uid"),
        {"uid": str(user_id)},
    ).first()
    return row[0] if row else None


def send_email(to: str, subject: str, body: str) -> bool:
    if not to:
        return False
    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                f"{EMAIL_SERVICE_URL}/api/email/send",
                json={"to": to, "subject": subject, "body": body},
            )
            response.raise_for_status()
        logger.info("Application code email queued for %s", to)
        return True
    except Exception:
        logger.exception("Failed to send application code email to %s", to)
        return False


def notify_application_codes(
    *,
    topic_title: str,
    student_email: str | None,
    teacher_email: str | None,
    student_code: str,
    teacher_code: str,
) -> dict[str, bool]:
    student_subject = "Код подтверждения заявки на тему ВКР"
    student_body = (
        f"Вы подали заявку на тему: «{topic_title}».\n\n"
        f"Ваш код подтверждения: {student_code}\n\n"
        "Введите его на сайте в разделе подтверждения заявки."
    )
    teacher_subject = "Новая заявка студента на тему ВКР"
    teacher_body = (
        f"На вашу тему «{topic_title}» поступила заявка.\n\n"
        f"Код подтверждения преподавателя: {teacher_code}\n\n"
        "Введите его на сайте в разделе «Заявки» после подтверждения студентом."
    )

    return {
        "student": send_email(student_email or "", student_subject, student_body),
        "teacher": send_email(teacher_email or "", teacher_subject, teacher_body),
    }
