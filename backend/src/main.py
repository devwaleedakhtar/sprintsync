from .database.core import engine, Base
from fastapi import FastAPI
# TODO: Import models here to register them
from .api import register_routes
from .logging import configure_logging, LogLevels

configure_logging(LogLevels.info)

app = FastAPI()


register_routes(app)
