from fastapi import APIRouter, status
from typing import List
from uuid import UUID

from ..database.core import DbSession
from . import models
from . import service
from ..auth.service import CurrentUser

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


@router.post("/", response_model=models.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(db: DbSession, task: models.TaskCreate, current_user: CurrentUser):
    return service.create_task(current_user, db, task)


@router.get("/", response_model=List[models.TaskResponse])
def get_tasks(db: DbSession, current_user: CurrentUser):
    return service.get_tasks(current_user, db)


@router.get("/{task_id}", response_model=models.TaskResponse)
def get_task(db: DbSession, task_id: UUID, current_user: CurrentUser):
    return service.get_task_by_id(current_user, db, task_id)


@router.put("/{task_id}", response_model=models.TaskResponse)
def update_task(db: DbSession, task_id: UUID, task_update: models.TaskCreate, current_user: CurrentUser):
    return service.update_task(current_user, db, task_id, task_update)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(db: DbSession, task_id: UUID, current_user: CurrentUser):
    service.delete_task(current_user, db, task_id)
