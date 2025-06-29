from dotenv import load_dotenv
from typing import AsyncGenerator
from .models import SuggestRequest
import os
from openai import AsyncOpenAI
from datetime import date
from src.auth.service import CurrentUser
from src.entities.daily_plan import DailyPlan
from sqlalchemy.orm import Session
from datetime import date as dt_date
from sqlalchemy import desc

client = AsyncOpenAI(api_key=os.getenv("OPENAI_KEY"))

load_dotenv()


async def ai_suggest_stream(request: SuggestRequest, current_user: CurrentUser) -> AsyncGenerator[str, None]:
    prompt = (
        f"Draft a detailed task description for the following title: '{request.title}'. "
        f"Return the description as a well-formatted markdown document. "
        f"Ensure there is a blank line between headings, paragraphs, and lists. "
        f"Use markdown features such as headings, lists, and bold where appropriate. Only return the markdown, no other text."
    )
    stream = await client.chat.completions.create(model="gpt-3.5-turbo",
                                                  messages=[
                                                      {"role": "user", "content": prompt}],
                                                  stream=True)

    async for event in stream:
        # Only yield the content string
        if event.choices and event.choices[0].delta and event.choices[0].delta.content:
            chunk = event.choices[0].delta.content or ""
            yield chunk


async def generate_daily_plan_for_user(user_id, tasks, db=None, daily_plan_id=None):
    today = date.today().isoformat()
    if not tasks:
        prompt = (
            f"Today is {today}. I have no tasks in Todo or In Progress status. "
            f"Suggest that I should meet with my team to discuss and come up with new tasks, "
            f"or suggest other productive activities I could focus on today. "
            f"Return the plan as a detailed markdown document with sections, headings, bullet points, and actionable steps. Only return the markdown, no other text."
        )
    else:
        task_list = '\n'.join(
            f"- {t.title}: {t.description} (Estimated: {t.total_minutes or 'unspecified'} min, Status: {t.status.value})"
            for t in tasks
        )
        prompt = (
            f"Today is {today}. Here are my tasks for today (only Todo and In Progress):\n"
            f"{task_list}\n\n"
            f"The working day is 8 hours (480 minutes). Suggest a detailed, actionable daily plan that fits within this time. "
            f"Prioritize Todo and In Progress tasks, and if there is not enough time, suggest which tasks to defer. "
            f"For each task included, mention the estimated time allocation. "
            f"Return the plan as a detailed markdown document with sections, headings, bullet points, and actionable steps. Only return the markdown, no other text."
        )

    completion = await client.chat.completions.create(model="gpt-3.5-turbo",
                                                      messages=[{"role": "user", "content": prompt}])
    plan_text = completion.choices[0].message.content

    # If daily_plan_id and db are provided, update the correct record
    if daily_plan_id and db:
        plan = db.query(DailyPlan).filter(
            DailyPlan.id == daily_plan_id).first()
        if plan:
            plan.plan = plan_text
            plan.updated_at = date.today()
            db.commit()
            return plan_text

    return plan_text


async def get_daily_plan_for_user(user_id, db: Session) -> DailyPlan | None:
    return db.query(DailyPlan).filter(
        DailyPlan.user_id == user_id
    ).order_by(DailyPlan.created_at.desc()).first()


async def stream_generate_and_save_daily_plan(current_user: CurrentUser, db: Session):
    from src.entities.task import Task, Status
    user_id = current_user.get_uuid()
    today = date.today()
    # Remove all existing plans for today for this user
    from src.entities.daily_plan import DailyPlan
    db.query(DailyPlan).filter(DailyPlan.user_id ==
                               user_id, DailyPlan.date == today).delete()
    db.commit()
    tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.status.in_([Status.Todo, Status.InProgress])
    ).all()
    if not tasks:
        prompt = (
            f"Today is {today}. I have no tasks in Todo or In Progress status. "
            f"Suggest that I should meet with my team to discuss and come up with new tasks, "
            f"or suggest other productive activities I could focus on today. "
            f"Return the plan as a detailed markdown document with sections, headings, bullet points, and actionable steps. Only return the markdown, no other text."
        )
    else:
        task_list = '\n'.join(
            f"- {t.title}: {t.description} (Estimated: {t.total_minutes or 'unspecified'} min, Status: {t.status.value})"
            for t in tasks
        )
        prompt = (
            f"Today is {today}. Here are my tasks for today (only Todo and In Progress):\n"
            f"{task_list}\n\n"
            f"The working day is 8 hours (480 minutes). Suggest a detailed, actionable daily plan that fits within this time. "
            f"Prioritize Todo and In Progress tasks, and if there is not enough time, suggest which tasks to defer. "
            f"For each task included, mention the estimated time allocation. "
            f"Return the plan as a detailed markdown document with sections, headings, bullet points, and actionable steps. Only return the markdown, no other text."
        )
    stream = await client.chat.completions.create(model="gpt-3.5-turbo",
                                                  messages=[
                                                      {"role": "user", "content": prompt}],
                                                  stream=True)
    plan_text = ""
    # Create a new DailyPlan record with placeholder text
    from datetime import datetime, timezone
    plan = DailyPlan(user_id=user_id, date=date.today(), plan="", created_at=datetime.now(
        timezone.utc), updated_at=datetime.now(timezone.utc))
    db.add(plan)
    db.commit()
    db.refresh(plan)
    async for event in stream:
        if event.choices and event.choices[0].delta and event.choices[0].delta.content:
            chunk = event.choices[0].delta.content
            plan_text += chunk
            plan.plan = plan_text
            plan.updated_at = datetime.now(timezone.utc)
            db.commit()
            yield chunk
    # Final save
    plan.plan = plan_text
    plan.updated_at = datetime.now(timezone.utc)
    db.commit()


def get_all_daily_plans_for_user(user_id, db: Session):
    from src.entities.daily_plan import DailyPlan
    return db.query(DailyPlan).filter(DailyPlan.user_id == user_id).order_by(desc(DailyPlan.date)).all()
