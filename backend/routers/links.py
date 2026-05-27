from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Brand, ContentDay, PostLink
from auth import get_current_user, require_admin
from datetime import datetime
import pytz

router = APIRouter(prefix="/links", tags=["links"])
WAT = pytz.timezone("Africa/Lagos")


class SubmitLinkRequest(BaseModel):
    brand_slug: str
    platform: str
    url: str
    date: str  # YYYY-MM-DD — the date the content was for


@router.post("/")
def submit_link(body: SubmitLinkRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Creator submits a post link for a brand/platform/date."""
    brand = db.query(Brand).filter(Brand.slug == body.brand_slug).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    for_date = datetime.strptime(body.date, "%Y-%m-%d")
    content_day = db.query(ContentDay).filter(
        ContentDay.brand_id == brand.id,
        ContentDay.for_date == for_date
    ).first()
    if not content_day:
        raise HTTPException(status_code=404, detail="No content found for this brand/date")

    # Check if link already submitted for this platform
    existing = db.query(PostLink).filter(
        PostLink.brand_id == brand.id,
        PostLink.content_day_id == content_day.id,
        PostLink.platform == body.platform
    ).first()

    if existing:
        # Update existing link
        existing.url = body.url
        existing.submitted_at = datetime.utcnow()
        existing.submitted_by = user.id
        db.commit()
        return {"message": "Link updated", "id": existing.id}

    link = PostLink(
        brand_id=brand.id,
        content_day_id=content_day.id,
        platform=body.platform,
        url=body.url,
        submitted_by=user.id
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return {"message": "Link submitted", "id": link.id}


@router.get("/")
def list_links(date: str = None, brand_slug: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """List submitted links. Filter by date and/or brand."""
    query = db.query(PostLink).join(Brand)
    if brand_slug:
        query = query.filter(Brand.slug == brand_slug)
    if date:
        from models import ContentDay
        dt = datetime.strptime(date, "%Y-%m-%d")
        query = query.join(ContentDay).filter(ContentDay.for_date == dt)

    links = query.order_by(PostLink.submitted_at.desc()).limit(100).all()
    return [
        {
            "id": l.id,
            "brand_name": l.brand.name,
            "brand_slug": l.brand.slug,
            "platform": l.platform,
            "url": l.url,
            "submitted_at": l.submitted_at.isoformat(),
            "for_date": l.content_day.for_date.strftime("%Y-%m-%d")
        }
        for l in links
    ]


@router.get("/status")
def link_status(date: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Get link submission status for all brands on a given date."""
    import json
    if not date:
        date = datetime.now(WAT).strftime("%Y-%m-%d")
    for_date = datetime.strptime(date, "%Y-%m-%d")

    brands = db.query(Brand).all()
    result = []
    for brand in brands:
        platforms = json.loads(brand.platforms)
        content_day = db.query(ContentDay).filter(
            ContentDay.brand_id == brand.id,
            ContentDay.for_date == for_date
        ).first()

        platform_status = {}
        if content_day:
            links = db.query(PostLink).filter(
                PostLink.brand_id == brand.id,
                PostLink.content_day_id == content_day.id
            ).all()
            submitted = {l.platform: l.url for l in links}
            for p in platforms:
                platform_status[p] = {"submitted": p in submitted, "url": submitted.get(p)}
        else:
            for p in platforms:
                platform_status[p] = {"submitted": False, "url": None}

        result.append({
            "brand_name": brand.name,
            "brand_slug": brand.slug,
            "has_content": content_day is not None,
            "platforms": platform_status,
            "all_submitted": all(v["submitted"] for v in platform_status.values())
        })

    return result


@router.delete("/{link_id}")
def delete_link(link_id: str, db: Session = Depends(get_db), admin=Depends(require_admin)):
    link = db.query(PostLink).filter(PostLink.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    db.delete(link)
    db.commit()
    return {"message": "Link deleted"}
