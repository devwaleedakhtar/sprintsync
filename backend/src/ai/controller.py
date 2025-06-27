from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from src.database.core import DbSession
from src.entities.daily_plan import DailyPlan
from .models import SuggestRequest, DailyPlanResponse
from .service import ai_suggest_stream, get_daily_plan_for_user
from src.auth.service import CurrentUser
from datetime import date as dt_date

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


@router.post("/suggest")
async def suggest(suggest_request: SuggestRequest, current_user: CurrentUser):
    async def event_stream():
        async for chunk in ai_suggest_stream(suggest_request, current_user):
            # Format as Server-Sent Events (SSE)
            yield f"data: {chunk}\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/daily-plan", response_model=DailyPlanResponse)
async def get_daily_plan(
    current_user: CurrentUser,
    db: DbSession,
    date: dt_date = Query(
        default=None, description="Date for the daily plan (YYYY-MM-DD)")
):
    plan_date = date or dt_date.today()
    user_id = current_user.get_uuid()
    daily_plan = await get_daily_plan_for_user(user_id, db, plan_date)
    if not daily_plan:
        raise HTTPException(status_code=404, detail="Daily plan not found.")
    return DailyPlanResponse(
        user_id=daily_plan.user_id,
        date=daily_plan.date,
        plan=daily_plan.plan
    )
