"""
Scoring job — runs every hour.
Calculates and updates daily, weekly, monthly scores for all brands.
"""
from datetime import datetime, timedelta
import pytz
from database import SessionLocal
from models import Brand
from services.scoring import (
    calculate_daily_score, calculate_weekly_score,
    calculate_monthly_score, upsert_score, get_period_key
)

WAT = pytz.timezone("Africa/Lagos")


def run_scoring():
    """Update scores for all brands across all periods."""
    db = SessionLocal()
    now_wat = datetime.now(WAT)
    today = now_wat.replace(hour=0, minute=0, second=0, microsecond=0)

    print(f"\n[ScoringJob] Updating scores at {now_wat.strftime('%H:%M')} WAT...")

    brands = db.query(Brand).all()
    for brand in brands:
        try:
            # Daily — today
            daily = calculate_daily_score(db, brand, today)
            upsert_score(db, brand, "daily", get_period_key("daily", today), daily)

            # Weekly — current week
            week_start = today - timedelta(days=today.weekday())
            weekly = calculate_weekly_score(db, brand, week_start)
            upsert_score(db, brand, "weekly", get_period_key("weekly", week_start), weekly)

            # Monthly — current month
            month_start = today.replace(day=1)
            monthly = calculate_monthly_score(db, brand, month_start)
            upsert_score(db, brand, "monthly", get_period_key("monthly", month_start), monthly)

            print(f"  [[OK]] {brand.name}: daily={daily['score']:.1f} | weekly={weekly['score']:.1f} | monthly={monthly['score']:.1f}")

        except Exception as e:
            print(f"  [ERR] Scoring error for {brand.name}: {e}")

    db.close()
    print(f"[ScoringJob] Done.\n")
