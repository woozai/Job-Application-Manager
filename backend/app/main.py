from fastapi import FastAPI

from app.core.config import settings
from app.routers import contact, health, job_application, user


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    app.include_router(health.router)
    app.include_router(user.router)
    app.include_router(job_application.router)
    app.include_router(contact.router)
    return app


app = create_app()
