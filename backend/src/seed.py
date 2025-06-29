from datetime import datetime, timezone, date
from sqlalchemy.exc import IntegrityError
from .database.core import SessionLocal
from .entities.user import User
from .entities.task import Task, Status
from .entities.daily_plan import DailyPlan
from .auth.service import get_password_hash

from .logger import configure_logging, LogLevels

configure_logging(LogLevels.info)

# Demo data
DEMO_USER_EMAIL = "demo@example.com"
DEMO_USER = {
    "email": DEMO_USER_EMAIL,
    "first_name": "Demo",
    "last_name": "User",
    "password": get_password_hash("demopassword"),
    "is_admin": True,
}

DEMO_TASKS = [
    {
        "title": "Setup project repository",
        "description": "Initialize the monorepo and push to GitHub.",
        "status": Status.Done,
        "total_minutes": 60,
    },
    {
        "title": "Implement authentication",
        "description": "Add login and registration endpoints.",
        "status": Status.InProgress,
        "total_minutes": 120,
    },
    {
        "title": "Design Kanban board UI",
        "description": "Create wireframes and initial React components.",
        "status": Status.Todo,
        "total_minutes": 180,
    },
]

DEMO_DAILY_PLAN = {
    "plan": """# Demo Daily Plan\n\n## Morning\n- Review project goals\n- Standup meeting\n\n## Work Blocks\n- Implement authentication (2h)\n- Design Kanban board UI (3h)\n\n## Afternoon\n- Code review\n- Update documentation\n\n## Wrap-up\n- Team sync\n- Plan for tomorrow\n""",
}


def seed():
    db = SessionLocal()
    try:
        # 1. Seed user
        user = db.query(User).filter_by(email=DEMO_USER_EMAIL).first()
        if not user:
            user = User(**DEMO_USER)
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created demo user: {user.email}")
        else:
            print(f"Demo user already exists: {user.email}")

        # 2. Seed tasks (idempotent by title+user)
        for task_data in DEMO_TASKS:
            task = db.query(Task).filter_by(
                user_id=user.id, title=task_data["title"]
            ).first()
            if not task:
                task = Task(
                    user_id=user.id,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                    **task_data,
                )
                db.add(task)
                print(f"Created demo task: {task.title}")
        db.commit()

        # 3. Seed daily plan (idempotent by user+date)
        today = date.today()
        plan = db.query(DailyPlan).filter_by(
            user_id=user.id, date=today).first()
        if not plan:
            plan = DailyPlan(
                user_id=user.id,
                date=today,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                plan=DEMO_DAILY_PLAN["plan"],
            )
            db.add(plan)
            db.commit()
            print(f"Created demo daily plan for {user.email} on {today}")
        else:
            print(
                f"Demo daily plan already exists for {user.email} on {today}")
    except IntegrityError as e:
        db.rollback()
        print(f"IntegrityError: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
