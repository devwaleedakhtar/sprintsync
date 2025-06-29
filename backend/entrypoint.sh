#!/bin/sh
set -e

alembic upgrade head
python -m src.seed
exec uvicorn src.main:app --host 0.0.0.0 --port 8000 