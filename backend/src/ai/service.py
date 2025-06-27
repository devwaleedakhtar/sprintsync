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

client = AsyncOpenAI(api_key=os.getenv("OPENAI_KEY"))

load_dotenv()


async def ai_suggest_stream(request: SuggestRequest, current_user: CurrentUser) -> AsyncGenerator[str, None]:
    prompt = f"Draft a detailed task description for the following title: '{request.title}' Only return the description, no other text."
    stream = await client.chat.completions.create(model="gpt-3.5-turbo",
                                                  messages=[
                                                      {"role": "user", "content": prompt}],
                                                  stream=True)

    print(current_user)
    async for event in stream:
        # Only yield the content string
        if event.choices and event.choices[0].delta and event.choices[0].delta.content:
            yield event.choices[0].delta.content


async def generate_daily_plan_for_user(user_id, tasks):
    # Compose a prompt with all today's tasks
    today = date.today().isoformat()
    task_list = '\n'.join(f"- {t.title}: {t.description}" for t in tasks)
    prompt = f"Today is {today}. Here are my tasks for today:\n{task_list}\n\nGenerate a concise, actionable daily plan for me."

    completion = await client.chat.completions.create(model="gpt-3.5-turbo",
                                                      messages=[{"role": "user", "content": prompt}])
    return completion.choices[0].message.content


async def get_daily_plan_for_user(user_id, db: Session, plan_date: dt_date) -> DailyPlan | None:
    return db.query(DailyPlan).filter(
        DailyPlan.user_id == user_id,
        DailyPlan.date == plan_date
    ).first()
