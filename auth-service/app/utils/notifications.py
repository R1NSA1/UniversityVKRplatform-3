import logging

from app.core.config import LOGIN_CODE_EMAIL_SUBJECT
from app.utils.email_client import send_email_via_service

logger = logging.getLogger(__name__)


def send_login_code_email(recipient: str, code: str) -> tuple[bool, str]:
    """Отправляет код входа через email-service. Режим: smtp | test | error."""
    subject = LOGIN_CODE_EMAIL_SUBJECT
    body = (
        f"Ваш код для входа в платформу ВКР: {code}\n\n"
        "Введите его на сайте на странице подтверждения.\n\n"
        "Если вы не запрашивали код, проигнорируйте это письмо."
    )
    sent, mode = send_email_via_service(recipient, subject, body)
    if not sent:
        logger.warning("Login code email was not delivered to %s", recipient)
    return sent, mode
