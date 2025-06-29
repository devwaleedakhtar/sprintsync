from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import register_routes
from .logger import configure_logging, LogLevels
import os

configure_logging(LogLevels.info)

app = FastAPI()

APP_URL = os.getenv("APP_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routes(app)
