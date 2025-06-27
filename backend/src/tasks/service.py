from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks
from . import models
from src.auth.models import TokenData
from src.entities.task import Task
from src.exceptions import TaskCreationError, TaskNotFoundError
from src.ai.service import generate_daily_plan_for_user
import logging
from src.entities.daily_plan import DailyPlan


def create_task(current_user: TokenData, db: Session, task: models.TaskCreate, background_tasks: BackgroundTasks = None) -> Task:
    try:
        new_task = Task(**task.model_dump())
        new_task.user_id = current_user.get_uuid()
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        logging.info(f"Created new task for user: {current_user.get_uuid()}")
        if background_tasks is not None:
            placeholder_id = upsert_daily_plan_placeholder(
                current_user.get_uuid(), db)
            background_tasks.add_task(
                generate_and_save_daily_plan, current_user.get_uuid(), db, placeholder_id)
        return new_task
    except Exception as e:
        logging.error(
            f"Failed to create task for user {current_user.get_uuid()}. Error: {str(e)}")
        raise TaskCreationError(str(e))


def get_tasks(current_user: TokenData, db: Session) -> list[models.TaskResponse]:
    tasks = db.query(Task).filter(
        Task.user_id == current_user.get_uuid()).all()
    logging.info(
        f"Retrieved {len(tasks)} tasks for user: {current_user.get_uuid()}")
    return tasks


def get_task_by_id(current_user: TokenData, db: Session, task_id: UUID) -> Task:
    task = db.query(Task).filter(Task.id == task_id).filter(
        Task.user_id == current_user.get_uuid()).first()
    if not task:
        logging.warning(
            f"Task {task_id} not found for user {current_user.get_uuid()}")
        raise TaskNotFoundError(task_id)
    logging.info(
        f"Retrieved task {task_id} for user {current_user.get_uuid()}")
    return task


def update_task(current_user: TokenData, db: Session, task_id: UUID, task_update: models.TaskUpdate, background_tasks: BackgroundTasks = None) -> Task:
    task_data = task_update.model_dump(exclude_unset=True)
    db.query(Task).filter(Task.id == task_id).filter(
        Task.user_id == current_user.get_uuid()).update(task_data)
    db.commit()
    logging.info(
        f"Successfully updated task {task_id} for user {current_user.get_uuid()}")
    if background_tasks is not None:
        placeholder_id = upsert_daily_plan_placeholder(
            current_user.get_uuid(), db)
        background_tasks.add_task(
            generate_and_save_daily_plan, current_user.get_uuid(), db, placeholder_id)
    return get_task_by_id(current_user, db, task_id)


def delete_task(current_user: TokenData, db: Session, task_id: UUID, background_tasks: BackgroundTasks = None) -> None:
    task = get_task_by_id(current_user, db, task_id)
    db.delete(task)
    db.commit()
    logging.info(f"Task {task_id} deleted by user {current_user.get_uuid()}")
    if background_tasks is not None:
        placeholder_id = upsert_daily_plan_placeholder(
            current_user.get_uuid(), db)
        background_tasks.add_task(
            generate_and_save_daily_plan, current_user.get_uuid(), db, placeholder_id)


async def generate_and_save_daily_plan(user_id, db, daily_plan_id):
    today = datetime.now(timezone.utc).date()
    from src.entities.task import Status
    tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.created_at >= today,
        Task.status.in_([Status.Todo, Status.InProgress])
    ).all()

    plan_text = await generate_daily_plan_for_user(user_id, tasks)

    plan = db.query(DailyPlan).filter(DailyPlan.id == daily_plan_id).first()
    if plan:
        plan.plan = plan_text
        plan.updated_at = datetime.now(timezone.utc)
    else:
        plan = DailyPlan(user_id=user_id, date=today, plan=plan_text)
        db.add(plan)
    db.commit()

    logging.info(f"Generated and saved daily plan for user {user_id}")


def upsert_daily_plan_placeholder(user_id, db):
    today = datetime.now(timezone.utc).date()
    placeholder = "Regenerating your daily plan..."
    plan = db.query(DailyPlan).filter(DailyPlan.user_id ==
                                      user_id, DailyPlan.date == today).first()
    if plan:
        plan.plan = placeholder
        plan.updated_at = datetime.now(timezone.utc)
    else:
        plan = DailyPlan(user_id=user_id, date=today, plan=placeholder)
        db.add(plan)
    db.commit()
    return plan.id
