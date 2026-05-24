import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

load_dotenv()

app = FastAPI(title="Email Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmailRequest(BaseModel):
    to: EmailStr
    subject: str
    body: str


def smtp_is_configured() -> bool:
    return bool(
        os.getenv("SMTP_HOST")
        and os.getenv("SMTP_PORT")
        and os.getenv("SMTP_USER")
        and os.getenv("SMTP_PASSWORD")
    )


def send_email_smtp(to: str, subject: str, body: str) -> str:
    """
    Отправляет письмо. Возвращает режим: 'smtp' или 'test'.
    """
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port_str = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    use_ssl = os.getenv("SMTP_USE_SSL", "true").lower() == "true"
    use_starttls = os.getenv("SMTP_USE_STARTTLS", "false").lower() == "true"

    if not smtp_user or not smtp_password or not smtp_host or not smtp_port_str:
        print(f"📧 [TEST MODE] To: {to}")
        print(f"   Subject: {subject}")
        print(f"   Body: {body}")
        print("-" * 50)
        return "test"

    try:
        smtp_port = int(smtp_port_str)
    except ValueError:
        print(f"❌ Invalid SMTP_PORT: {smtp_port_str}")
        raise ValueError(f"Invalid SMTP_PORT: {smtp_port_str}")

    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = os.getenv("SMTP_FROM", smtp_user)
    msg["To"] = to

    try:
        if use_ssl and not use_starttls:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=30) as server:
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
                if use_starttls:
                    server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
        print(f"✅ Email sent to {to}")
        return "smtp"
    except Exception as e:
        print(f"❌ Failed to send email to {to}: {e}")
        raise


@app.get("/health")
async def health():
    return {"status": "ok", "service": "email", "smtp_configured": smtp_is_configured()}


@app.post("/api/email/send")
async def send_email(request: EmailRequest):
    try:
        mode = send_email_smtp(request.to, request.subject, request.body)
        return {"status": "sent", "to": request.to, "mode": mode}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/email/send-test")
async def send_test():
    mode = send_email_smtp("test@example.com", "Test Subject", "This is a test email body.")
    return {"status": "test sent", "mode": mode}
