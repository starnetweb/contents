import os
import sys
# Force UTF-8 output on Windows to handle emojis in logs
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine
import models

load_dotenv()

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

# Run lightweight column migrations for existing databases
def _migrate():
    from sqlalchemy import text, inspect
    with engine.connect() as conn:
        inspector = inspect(engine)
        user_cols = [c["name"] for c in inspector.get_columns("users")]
        if "telegram_chat_id" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN telegram_chat_id VARCHAR"))
            print("[migrate] Added users.telegram_chat_id")
        if "telegram_token" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN telegram_token VARCHAR"))
            print("[migrate] Added users.telegram_token")
        conn.commit()

_migrate()

app = FastAPI(
    title="Content Agent API",
    description="AI-powered social media content agent for 6 Nigerian brands",
    version="1.0.0"
)

# CORS
origins = [
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]
# Support multiple comma-separated origins in FRONTEND_URL
extra = os.getenv("EXTRA_ORIGINS", "")
if extra:
    origins += [o.strip() for o in extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from routers import auth, brands, content, links, scores
app.include_router(auth.router)
app.include_router(brands.router)
app.include_router(content.router)
app.include_router(links.router)
app.include_router(scores.router)


@app.on_event("startup")
async def startup():
    _auto_seed()
    await _register_telegram_webhook()
    from jobs.scheduler import start_scheduler
    start_scheduler()
    print("\n[OK] Content Agent API running")
    print(f"   Docs: http://localhost:{os.getenv('PORT', 4000)}/docs\n")


async def _register_telegram_webhook():
    """Register Telegram webhook so the bot receives messages."""
    token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    vps_host = os.getenv("VPS_HOST", "")
    if not token or not vps_host or token == "your_token_here":
        print("[Telegram] Skipping webhook registration — token or VPS_HOST not set")
        return
    try:
        import httpx
        webhook_url = f"http://{vps_host}:4001/auth/telegram/webhook"
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"https://api.telegram.org/bot{token}/setWebhook",
                json={"url": webhook_url}
            )
            result = resp.json()
            if result.get("ok"):
                print(f"[Telegram] Webhook registered: {webhook_url}")
            else:
                print(f"[Telegram] Webhook registration failed: {result}")
    except Exception as e:
        print(f"[Telegram] Webhook registration error: {e}")


def _auto_seed():
    """Seed brands and default admin user if the database is empty."""
    import json
    from passlib.context import CryptContext
    from database import SessionLocal
    from models import User, Brand
    from data.brands import BRANDS

    db = SessionLocal()
    try:
        # Seed admin user if none exists
        if not db.query(User).first():
            pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
            db.add(User(
                name="Admin",
                email="admin@contentagent.com",
                password=pwd.hash("admin123"),
                role="admin",
            ))
            print("[seed] Created default admin user: admin@contentagent.com / admin123")

        # Seed brands if none exist
        if not db.query(Brand).first():
            for b in BRANDS:
                db.add(Brand(
                    name=b["name"],
                    slug=b["slug"],
                    description=b["description"],
                    website=b["website"],
                    niche=b["niche"],
                    target_audience=b["target_audience"],
                    platforms=json.dumps(b["platforms"]),
                    telegram_chat_id=os.getenv(b.get("telegram_env_key", ""), None),
                ))
            print(f"[seed] Created {len(BRANDS)} brands")

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[seed] Warning: auto-seed failed: {e}")
    finally:
        db.close()


@app.get("/")
def root():
    return {"status": "ok", "message": "Content Agent API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 4000)), reload=True)
