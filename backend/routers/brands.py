import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Brand
from auth import get_current_user, require_admin

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("/")
def list_brands(db: Session = Depends(get_db), user=Depends(get_current_user)):
    brands = db.query(Brand).all()
    return [
        {
            "id": b.id,
            "name": b.name,
            "slug": b.slug,
            "description": b.description,
            "website": b.website,
            "niche": b.niche,
            "platforms": json.loads(b.platforms),
            "has_telegram": bool(b.telegram_chat_id),
            "telegram_chat_id": b.telegram_chat_id or "",
            "is_active": b.is_active,
        }
        for b in brands
    ]


@router.put("/{brand_id}/toggle")
def toggle_brand(brand_id: str, db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Enable or disable a brand from content generation."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    brand.is_active = not brand.is_active
    db.commit()
    return {"id": brand.id, "name": brand.name, "is_active": brand.is_active}


@router.put("/{brand_id}/telegram")
def update_telegram(brand_id: str, body: dict, db: Session = Depends(get_db), admin=Depends(require_admin)):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    brand.telegram_chat_id = body.get("chat_id")
    db.commit()
    return {"message": "Telegram chat ID updated"}
