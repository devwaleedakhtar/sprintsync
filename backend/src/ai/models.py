from pydantic import BaseModel
from uuid import UUID
from datetime import date


class SuggestRequest(BaseModel):
    title: str


class SuggestResponse(BaseModel):
    description: str


class DailyPlanResponse(BaseModel):
    user_id: UUID
    date: date
    plan: str
