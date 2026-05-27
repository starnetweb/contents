"""
Scoring service — calculates daily, weekly, and monthly scores per brand.

Scoring weights:
  - Link submitted on time (before 4pm):  20 pts
  - Content posted on scheduled day:      30 pts
  - Engagement rate:                      30 pts
  - Reach / impressions:                  20 pts
  Total:                                 100 pts
"""
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import Brand, PostLink, PostMetric, Score, ContentDay


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_period_key(period: str, dt: datetime) -> str:
    if period == "daily":
        return dt.strftime("%Y-%m-%d")
    elif period == "weekly":
        return f"{dt.year}-W{dt.strftime('%W')}"
    elif period == "monthly":
        return dt.strftime("%Y-%m")
    return ""


def engagement_score(metrics: PostMetric | None) -> float:
    """Calculate engagement rate score (0–30)."""
    if not metrics or metrics.followers == 0:
        return 0.0
    total_engagement = metrics.likes + metrics.comments + metrics.shares + metrics.saves
    rate = (total_engagement / metrics.followers) * 100
    # 3%+ is excellent, scale: 0–3% → 0–30 pts
    score = min((rate / 3.0) * 30, 30)
    return round(score, 2)


def reach_score(metrics: PostMetric | None) -> float:
    """Calculate reach score (0–20)."""
    if not metrics or metrics.followers == 0:
        return 0.0
    if metrics.impressions == 0:
        return 0.0
    rate = (metrics.reach / max(metrics.impressions, 1)) * 100
    score = min((rate / 50.0) * 20, 20)
    return round(score, 2)


# ── Daily Score ───────────────────────────────────────────────────────────────

def calculate_daily_score(db: Session, brand: Brand, date: datetime) -> dict:
    date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
    date_end = date_start + timedelta(days=1)
    deadline = date_start.replace(hour=16, minute=0)  # 4pm WAT

    # Get content day
    content_day = db.query(ContentDay).filter(
        ContentDay.brand_id == brand.id,
        ContentDay.for_date >= date_start,
        ContentDay.for_date < date_end
    ).first()

    if not content_day:
        return {"score": 0.0, "breakdown": {
            "link_submission": 0, "on_time_posting": 0,
            "engagement": 0, "reach": 0, "note": "No content generated for this date"
        }}

    platforms = json.loads(brand.platforms)
    total_platforms = len(platforms)
    if total_platforms == 0:
        return {"score": 0.0, "breakdown": {"note": "No platforms configured"}}

    link_score = 0.0
    posting_score = 0.0
    eng_score = 0.0
    reach_sc = 0.0

    for platform in platforms:
        link = db.query(PostLink).filter(
            PostLink.brand_id == brand.id,
            PostLink.content_day_id == content_day.id,
            PostLink.platform == platform
        ).first()

        # Link submitted on time? (20 pts total / platforms)
        if link:
            if link.submitted_at <= deadline:
                link_score += 20 / total_platforms
            else:
                link_score += (20 / total_platforms) * 0.5  # half credit for late

            # Content posted (link exists = posted): 30 pts total / platforms
            posting_score += 30 / total_platforms

            # Get latest metrics
            latest_metric = db.query(PostMetric).filter(
                PostMetric.post_link_id == link.id
            ).order_by(PostMetric.fetched_at.desc()).first()

            eng_score += engagement_score(latest_metric) / total_platforms * (30 / 30)
            reach_sc += reach_score(latest_metric) / total_platforms * (20 / 20)

    total = round(link_score + posting_score + eng_score + reach_sc, 2)

    breakdown = {
        "link_submission": round(link_score, 2),
        "on_time_posting": round(posting_score, 2),
        "engagement":      round(eng_score, 2),
        "reach":           round(reach_sc, 2),
    }
    return {"score": total, "breakdown": breakdown}


# ── Weekly Score ──────────────────────────────────────────────────────────────

def calculate_weekly_score(db: Session, brand: Brand, week_start: datetime) -> dict:
    daily_scores = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        result = calculate_daily_score(db, brand, day)
        daily_scores.append(result["score"])

    avg = round(sum(daily_scores) / 7, 2)
    # Consistency bonus: +5 if all 7 days have score > 0
    bonus = 5 if all(s > 0 for s in daily_scores) else 0
    total = min(avg + bonus, 100)

    return {
        "score": total,
        "breakdown": {
            "daily_scores": daily_scores,
            "average": avg,
            "consistency_bonus": bonus
        }
    }


# ── Monthly Score ─────────────────────────────────────────────────────────────

def calculate_monthly_score(db: Session, brand: Brand, month_start: datetime) -> dict:
    # Get all days in month
    next_month = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
    days_in_month = (next_month - month_start).days

    daily_scores = []
    for i in range(days_in_month):
        day = month_start + timedelta(days=i)
        if day.replace(tzinfo=None) > datetime.utcnow():
            break
        result = calculate_daily_score(db, brand, day)
        daily_scores.append(result["score"])

    if not daily_scores:
        return {"score": 0.0, "breakdown": {"note": "No data yet"}}

    avg = round(sum(daily_scores) / len(daily_scores), 2)
    # Trend: compare last 7 days vs first 7 days
    trend = "stable"
    if len(daily_scores) >= 14:
        first_7 = sum(daily_scores[:7]) / 7
        last_7 = sum(daily_scores[-7:]) / 7
        if last_7 > first_7 + 5:
            trend = "improving"
        elif last_7 < first_7 - 5:
            trend = "declining"

    return {
        "score": avg,
        "breakdown": {
            "days_tracked": len(daily_scores),
            "average": avg,
            "trend": trend,
            "best_day": max(daily_scores),
            "worst_day": min(daily_scores),
        }
    }


# ── Upsert Score ──────────────────────────────────────────────────────────────

def upsert_score(db: Session, brand: Brand, period: str, period_key: str, result: dict):
    existing = db.query(Score).filter(
        Score.brand_id == brand.id,
        Score.period == period,
        Score.period_key == period_key
    ).first()

    if existing:
        existing.score = result["score"]
        existing.breakdown = json.dumps(result["breakdown"])
    else:
        score = Score(
            brand_id=brand.id,
            period=period,
            period_key=period_key,
            score=result["score"],
            breakdown=json.dumps(result["breakdown"])
        )
        db.add(score)
    db.commit()
