from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from src.entities.task import Status


class TaskBase(BaseModel):
    title: str
    description: str


class TaskCreate(TaskBase):
    total_minutes: int


class TaskResponse(TaskBase):
    id: UUID
    total_minutes: Optional[int] = None
    status: Status
    created_at: datetime
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    model_config = ConfigDict(from_attributes=True)


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    total_minutes: Optional[int] = None
    status: Optional[Status] = None
