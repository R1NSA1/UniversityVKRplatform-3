from fastapi import FastAPI
from app.routers import topics
from app.main import appcd topic-service


app = FastAPI(title="Topic Service", description="Управление темами ВКР и заявками")
app.include_router(topics.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "topic"}