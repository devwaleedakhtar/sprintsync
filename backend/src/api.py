from fastapi import FastAPI

from src.auth.controller import router as auth_router
from src.users.controller import router as user_router
from src.tasks.controller import router as task_router


def register_routes(app: FastAPI):
    app.include_router(auth_router)
    app.include_router(user_router)
    app.include_router(task_router)
