import logging
import os

import httpx

logger = logging.getLogger(__name__)

EMAIL_SERVICE_URL = os.getenv("EMAIL_SERVICE_URL", "http://email-service:8000").rstrip("/")


def send_email_via_service(to: str, subject: str, body: str) -> tuple[bool, str]:
    """Возвращает (успех, режим: smtp | test | error)."""
    if not to:
        return False, "error"
    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                f"{EMAIL_SERVICE_URL}/api/email/send",
                json={"to": to, "subject": subject, "body": body},
            )
            response.raise_for_status()
            mode = response.json().get("mode", "smtp")
        logger.info("Email sent via email-service to %s (mode=%s)", to, mode)
        return True, mode
    except Exception:
        logger.exception("Failed to send email to %s via email-service", to)
        return False, "error"
