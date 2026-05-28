from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models import User
from auth import verify_password, hash_password, create_token, get_current_user, require_admin
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "creator"


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"sub": user.id, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role, "name": user.name}


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Only admins can create new users."""
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=body.name,
        email=body.email,
        password=hash_password(body.password),
        role=body.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id, "name": user.name, "email": user.email, "role": user.role,
        "telegram_connected": bool(user.telegram_chat_id)
    }


@router.post("/telegram/generate-link")
def generate_telegram_link(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate a one-time token the user sends to the bot to link their Telegram account."""
    import os
    token = str(uuid.uuid4()).replace("-", "")[:16]
    user.telegram_token = token
    db.commit()
    bot_username = os.getenv("TELEGRAM_BOT_USERNAME", "your_bot")
    return {
        "token": token,
        "link": f"https://t.me/{bot_username}?start={token}",
        "instruction": f"Open the link and press Start, or send /start {token} to the bot"
    }


@router.post("/telegram/webhook")
async def telegram_webhook(request: Request, db: Session = Depends(get_db)):
    """Receive updates from Telegram bot — matches token to user and saves chat_id."""
    data = await request.json()
    message = data.get("message", {})
    text = message.get("text", "")
    chat_id = str(message.get("chat", {}).get("id", ""))

    # Handle /start <token>
    if text.startswith("/start "):
        token = text.split(" ", 1)[1].strip()
        user = db.query(User).filter(User.telegram_token == token).first()
        if user:
            user.telegram_chat_id = chat_id
            user.telegram_token = None
            db.commit()
            # Send confirmation
            try:
                from services.telegram_service import _get_bot
                import asyncio
                asyncio.create_task(
                    _get_bot().send_message(
                        chat_id=chat_id,
                        text=f"✅ Your Telegram is now connected to Content Agent, {user.name}!\n\nYou'll receive content notifications here."
                    )
                )
            except Exception:
                pass
            return {"ok": True}
    return {"ok": True}


@router.get("/telegram/status")
def telegram_status(user: User = Depends(get_current_user)):
    return {"connected": bool(user.telegram_chat_id)}


@router.get("/users")
def list_users(db: Session = Depends(get_db), admin=Depends(require_admin)):
    users = db.query(User).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "is_active": u.is_active} for u in users]


@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
