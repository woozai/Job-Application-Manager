from fastapi import FastAPI

from app.core.config import settings
from app.routers import health, user


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    app.include_router(health.router)
    app.include_router(user.router)
    return app


app = create_app()
