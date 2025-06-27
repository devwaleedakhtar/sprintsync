from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from datetime import datetime, timezone
import enum
from ..database.core import Base


class Status(enum.Enum):
    Todo = "Todo"
    InProgress = "In Progress"
    Done = "Done"


class Task(Base):
    __tablename__ = 'tasks'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        'users.id'), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(Enum(Status), nullable=False, default=Status.Todo)
    total_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False,
                        default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False,
                        default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Task(title='{self.title}', status='{self.status}', total_minutes={self.total_minutes})>"
