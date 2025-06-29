from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from src.database.core import DbSession
from src.entities.daily_plan import DailyPlan
from .models import SuggestRequest, DailyPlanResponse
from .service import ai_suggest_stream, get_daily_plan_for_user, stream_generate_and_save_daily_plan, get_all_daily_plans_for_user
from src.auth.service import CurrentUser
from datetime import date as dt_date
import base64

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


@router.post("/suggest")
async def suggest(suggest_request: SuggestRequest, current_user: CurrentUser):
    async def event_stream():
        async for chunk in ai_suggest_stream(suggest_request, current_user):
            encoded = base64.b64encode(chunk.encode('utf-8')).decode('utf-8')
            yield f"data: {encoded}\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/daily-plan", response_model=DailyPlanResponse)
async def get_daily_plan(
    current_user: CurrentUser,
    db: DbSession,
):
    user_id = current_user.get_uuid()
    daily_plan = await get_daily_plan_for_user(user_id, db)
    if not daily_plan:
        raise HTTPException(status_code=404, detail="Daily plan not found.")
    return DailyPlanResponse(
        user_id=daily_plan.user_id,
        date=daily_plan.date,
        plan=daily_plan.plan
    )


@router.post("/daily-plan/generate")
async def generate_daily_plan(current_user: CurrentUser, db: DbSession):
    async def event_stream():
        async for chunk in stream_generate_and_save_daily_plan(current_user, db):
            yield f"data: {chunk}\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/daily-plan/history")
async def get_daily_plan_history(current_user: CurrentUser, db: DbSession):
    user_id = current_user.get_uuid()
    plans = get_all_daily_plans_for_user(user_id, db)
    return [
        {"user_id": p.user_id, "date": p.date, "plan": p.plan,
            "created_at": p.created_at, "updated_at": p.updated_at}
        for p in plans
    ]
