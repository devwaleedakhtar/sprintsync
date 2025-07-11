from fastapi import APIRouter, status, BackgroundTasks
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
def create_task(db: DbSession, task: models.TaskCreate, current_user: CurrentUser, background_tasks: BackgroundTasks):
    return service.create_task(current_user, db, task, background_tasks)


@router.get("/", response_model=List[models.TaskResponse])
def get_tasks(db: DbSession, current_user: CurrentUser):
    return service.get_tasks(current_user, db)


@router.get("/{task_id}", response_model=models.TaskResponse)
def get_task(db: DbSession, task_id: UUID, current_user: CurrentUser):
    return service.get_task_by_id(current_user, db, task_id)


@router.put("/{task_id}", response_model=models.TaskResponse)
def update_task(db: DbSession, task_id: UUID, task_update: models.TaskUpdate, current_user: CurrentUser, background_tasks: BackgroundTasks):
    return service.update_task(current_user, db, task_id, task_update, background_tasks)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(db: DbSession, task_id: UUID, current_user: CurrentUser, background_tasks: BackgroundTasks):
    service.delete_task(current_user, db, task_id, background_tasks)
