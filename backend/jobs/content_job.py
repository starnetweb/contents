"""
Content generation job — runs at 5:00 PM WAT.
1. Searches for last-24h news per brand
2. Loads previously used ideas (last 14 days) for duplicate prevention
3. Generates ONE idea adapted across all platforms via Claude
4. Saves to DB
Then at 5:30 PM, sends via Telegram.
"""
import json
from datetime import datetime, timedelta
import pytz
from database import SessionLocal
from models import Brand, ContentDay
from services.search import search_brand_news
from services.content_gen import generate_content_for_brand
from services.telegram_service import send_content_calendar, run_async
from data.brands import BRANDS

WAT = pytz.timezone("Africa/Lagos")


def get_previous_ideas(db, brand_id: str, days: int = 14) -> list[str]:
    """Fetch the central ideas used in the last N days for a brand."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    past_days = db.query(ContentDay).filter(
        ContentDay.brand_id == brand_id,
        ContentDay.generated_at >= cutoff
    ).order_by(ContentDay.generated_at.desc()).all()

    ideas = []
    for cd in past_days:
        try:
            cards = json.loads(cd.content)
            # central_idea is stored on each card
            if cards and cards[0].get("central_idea"):
                ideas.append(cards[0]["central_idea"])
        except Exception:
            pass
    return ideas


def run_content_generation(force: bool = False):
    """Generate content for all active brands. Called at 5:00 PM WAT.
    force=True deletes existing content and regenerates — used by manual 'Generate Now'."""
    db = SessionLocal()
    now_wat = datetime.now(WAT)
    tomorrow = (now_wat + timedelta(days=1)).strftime("%Y-%m-%d")

    print(f"\n[ContentJob] Starting content generation for {tomorrow} (force={force})...")

    for brand_data in BRANDS:
        try:
            brand = db.query(Brand).filter(Brand.slug == brand_data["slug"]).first()
            if not brand:
                print(f"  [!] Brand not found in DB: {brand_data['slug']}")
                continue
            if not brand.is_active:
                print(f"  [-] Skipping inactive brand: {brand.name}")
                continue

            # Check if content already generated for tomorrow
            for_date = datetime.strptime(tomorrow, "%Y-%m-%d")
            existing = db.query(ContentDay).filter(
                ContentDay.brand_id == brand.id,
                ContentDay.for_date == for_date
            ).first()
            if existing:
                if force:
                    print(f"  [~] Force-regenerating content for {brand.name} / {tomorrow}")
                    db.delete(existing)
                    db.commit()
                else:
                    print(f"  [~] Content already exists for {brand.name} / {tomorrow} (use force=True to regenerate)")
                    continue

            # Fetch previous ideas to prevent duplicates
            previous_ideas = get_previous_ideas(db, brand.id)

            # Only ExamKits searches for news — all other brands use evergreen strategy
            if brand_data["slug"] == "examkits":
                print(f"  [>>] Searching last-24h news for {brand.name} (news strategy)...")
                news = search_brand_news(brand_data)
                print(f"       Found {len(news)} news items")
            else:
                print(f"  [>>] Skipping news search for {brand.name} (evergreen strategy)...")
                news = []  # No news — Claude will generate a fresh evergreen idea

            print(f"  [>>] Generating content for {brand.name} (avoiding {len(previous_ideas)} past ideas)...")
            cards = generate_content_for_brand(brand_data, news, tomorrow, previous_ideas, brand.custom_prompt or "")

            if not cards:
                print(f"  [!] No content generated for {brand.name}")
                continue

            content_day = ContentDay(
                brand_id=brand.id,
                for_date=for_date,
                content=json.dumps(cards),
                news_context=json.dumps(news),
                status="draft"
            )
            db.add(content_day)
            db.commit()
            print(f"  [OK] Saved {len(cards)} platform cards for {brand.name}")

        except Exception as e:
            print(f"  [ERR] Error processing {brand_data['name']}: {e}")
            db.rollback()

    db.close()
    print(f"[ContentJob] Done.\n")


def send_todays_content():
    """Send generated content calendars to Telegram. Called at 5:30 PM WAT."""
    db = SessionLocal()
    now_wat = datetime.now(WAT)
    tomorrow = (now_wat + timedelta(days=1)).strftime("%Y-%m-%d")
    for_date = datetime.strptime(tomorrow, "%Y-%m-%d")

    print(f"\n[TelegramJob] Sending content calendars for {tomorrow}...")

    for brand_data in BRANDS:
        try:
            brand = db.query(Brand).filter(Brand.slug == brand_data["slug"]).first()
            if not brand or not brand.telegram_chat_id:
                print(f"  [!] No Telegram chat ID for {brand_data['name']}")
                continue

            content_day = db.query(ContentDay).filter(
                ContentDay.brand_id == brand.id,
                ContentDay.for_date == for_date
            ).first()

            if not content_day:
                print(f"  [!] No content found for {brand.name} / {tomorrow}")
                continue

            cards = json.loads(content_day.content)
            run_async(send_content_calendar(
                brand_name=brand.name,
                chat_id=brand.telegram_chat_id,
                cards=cards,
                for_date=tomorrow
            ))
            print(f"  [OK] Sent to Telegram: {brand.name}")

        except Exception as e:
            print(f"  [ERR] Telegram error for {brand_data['name']}: {e}")

    db.close()
    print(f"[TelegramJob] Done.\n")
