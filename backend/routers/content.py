import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import Brand, ContentDay
from auth import get_current_user, require_admin
from jobs.content_job import run_content_generation, send_todays_content

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/")
def list_content(date: str = None, brand_slug: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Get content days. Filter by date (YYYY-MM-DD) and/or brand_slug."""
    query = db.query(ContentDay).join(Brand)
    if date:
        dt = datetime.strptime(date, "%Y-%m-%d")
        query = query.filter(ContentDay.for_date == dt)
    if brand_slug:
        query = query.filter(Brand.slug == brand_slug)
    days = query.order_by(ContentDay.for_date.desc()).limit(50).all()

    return [
        {
            "id": cd.id,
            "brand_id": cd.brand_id,
            "brand_name": cd.brand.name,
            "brand_slug": cd.brand.slug,
            "for_date": cd.for_date.strftime("%Y-%m-%d"),
            "status": cd.status,
            "generated_at": cd.generated_at.isoformat(),
            "cards": json.loads(cd.content),
            "news_context": json.loads(cd.news_context) if cd.news_context else []
        }
        for cd in days
    ]


@router.get("/{content_day_id}")
def get_content(content_day_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    cd = db.query(ContentDay).filter(ContentDay.id == content_day_id).first()
    if not cd:
        raise HTTPException(status_code=404, detail="Content not found")
    return {
        "id": cd.id,
        "brand_name": cd.brand.name,
        "for_date": cd.for_date.strftime("%Y-%m-%d"),
        "status": cd.status,
        "cards": json.loads(cd.content),
        "news_context": json.loads(cd.news_context) if cd.news_context else []
    }


@router.put("/{content_day_id}/approve")
def approve_content(content_day_id: str, db: Session = Depends(get_db), admin=Depends(require_admin)):
    cd = db.query(ContentDay).filter(ContentDay.id == content_day_id).first()
    if not cd:
        raise HTTPException(status_code=404, detail="Content not found")
    cd.status = "approved"
    db.commit()
    return {"message": "Content approved"}


@router.put("/{content_day_id}/cards")
def update_cards(content_day_id: str, body: dict, db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Admin can edit the generated content cards before sending."""
    cd = db.query(ContentDay).filter(ContentDay.id == content_day_id).first()
    if not cd:
        raise HTTPException(status_code=404, detail="Content not found")
    cd.content = json.dumps(body.get("cards", []))
    db.commit()
    return {"message": "Content updated"}


@router.post("/generate")
def trigger_generation(background_tasks: BackgroundTasks, db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Admin can manually trigger content generation."""
    active_brands = db.query(Brand).filter(Brand.is_active == True).count()
    if active_brands == 0:
        return {"message": "No active brands to generate content for. Enable at least one brand first.", "status": "skipped"}
    background_tasks.add_task(run_content_generation)
    return {"message": f"Content generation started for {active_brands} active brand(s). Check back in 1-2 minutes.", "status": "started", "brands": active_brands}


@router.post("/send")
def trigger_send(background_tasks: BackgroundTasks, admin=Depends(require_admin)):
    """Admin can manually trigger Telegram delivery."""
    background_tasks.add_task(send_todays_content)
    return {"message": "Sending content to Telegram channels...", "status": "started"}
