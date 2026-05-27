import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Brand, Score
from auth import get_current_user
from jobs.scoring_job import run_scoring
from fastapi import BackgroundTasks

router = APIRouter(prefix="/scores", tags=["scores"])


@router.get("/")
def get_scores(
    period: str = "daily",
    period_key: str = None,
    brand_slug: str = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Get scores for all brands.
    period: daily | weekly | monthly
    period_key: e.g. 2025-01-20 | 2025-W03 | 2025-01
    """
    from datetime import datetime
    import pytz
    WAT = pytz.timezone("Africa/Lagos")

    if not period_key:
        now = datetime.now(WAT)
        if period == "daily":
            period_key = now.strftime("%Y-%m-%d")
        elif period == "weekly":
            period_key = f"{now.year}-W{now.strftime('%W')}"
        elif period == "monthly":
            period_key = now.strftime("%Y-%m")

    query = db.query(Score).join(Brand).filter(
        Score.period == period,
        Score.period_key == period_key
    )
    if brand_slug:
        query = query.filter(Brand.slug == brand_slug)

    scores = query.order_by(Score.score.desc()).all()
    return [
        {
            "brand_name": s.brand.name,
            "brand_slug": s.brand.slug,
            "period": s.period,
            "period_key": s.period_key,
            "score": s.score,
            "breakdown": json.loads(s.breakdown) if s.breakdown else {},
            "updated_at": s.updated_at.isoformat() if s.updated_at else None
        }
        for s in scores
    ]


@router.get("/leaderboard")
def leaderboard(period: str = "weekly", db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Get brand leaderboard for current period."""
    from datetime import datetime
    import pytz
    WAT = pytz.timezone("Africa/Lagos")
    now = datetime.now(WAT)

    if period == "daily":
        period_key = now.strftime("%Y-%m-%d")
    elif period == "weekly":
        period_key = f"{now.year}-W{now.strftime('%W')}"
    else:
        period_key = now.strftime("%Y-%m")

    scores = db.query(Score).join(Brand).filter(
        Score.period == period,
        Score.period_key == period_key
    ).order_by(Score.score.desc()).all()

    return [
        {
            "rank": i + 1,
            "brand_name": s.brand.name,
            "brand_slug": s.brand.slug,
            "score": s.score,
        }
        for i, s in enumerate(scores)
    ]


@router.get("/history/{brand_slug}")
def score_history(brand_slug: str, period: str = "daily", limit: int = 30, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Get score history for a brand (for charts)."""
    brand = db.query(Brand).filter(Brand.slug == brand_slug).first()
    if not brand:
        return []
    scores = db.query(Score).filter(
        Score.brand_id == brand.id,
        Score.period == period
    ).order_by(Score.period_key.asc()).limit(limit).all()

    return [
        {"period_key": s.period_key, "score": s.score}
        for s in scores
    ]


@router.post("/recalculate")
def recalculate(background_tasks: BackgroundTasks, user=Depends(get_current_user)):
    """Manually trigger score recalculation."""
    background_tasks.add_task(run_scoring)
    return {"message": "Score recalculation started"}
