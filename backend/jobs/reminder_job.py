"""
Reminder job — runs at 4:00 PM WAT.
Checks which brands are missing post links for today.
Sends Telegram reminders for missing ones.
"""
import json
from datetime import datetime, timedelta
import pytz
from database import SessionLocal
from models import Brand, ContentDay, PostLink, ReminderLog
from services.telegram_service import send_reminder, run_async
from data.brands import BRANDS

WAT = pytz.timezone("Africa/Lagos")


def run_reminder_check():
    """Check for missing post links and send reminders. Called at 4:00 PM WAT."""
    db = SessionLocal()
    now_wat = datetime.now(WAT)
    today = now_wat.strftime("%Y-%m-%d")
    today_dt = datetime.strptime(today, "%Y-%m-%d")

    print(f"\n[ReminderJob] Checking post links for {today}...")

    for brand_data in BRANDS:
        try:
            brand = db.query(Brand).filter(Brand.slug == brand_data["slug"]).first()
            if not brand:
                continue

            content_day = db.query(ContentDay).filter(
                ContentDay.brand_id == brand.id,
                ContentDay.for_date == today_dt
            ).first()

            if not content_day:
                # No content generated — skip reminder (not the creator's fault)
                continue

            platforms = json.loads(brand.platforms)
            submitted = db.query(PostLink).filter(
                PostLink.brand_id == brand.id,
                PostLink.content_day_id == content_day.id
            ).all()

            submitted_platforms = {link.platform for link in submitted}
            missing = [p for p in platforms if p not in submitted_platforms]

            if not missing:
                print(f"  [[OK]] All links submitted for {brand.name}")
                continue

            # Check if we already sent a reminder today
            already_reminded = db.query(ReminderLog).filter(
                ReminderLog.brand_id == brand.id,
                ReminderLog.for_date == today_dt,
                ReminderLog.type == "link_missing"
            ).first()

            if already_reminded:
                print(f"  [~] Already reminded {brand.name} today")
                continue

            # Send reminder
            if brand.telegram_chat_id:
                run_async(send_reminder(
                    brand_name=brand.name,
                    chat_id=brand.telegram_chat_id,
                    missing_platforms=missing,
                    for_date=today
                ))

            # Log the reminder
            log = ReminderLog(
                brand_id=brand.id,
                for_date=today_dt,
                type="link_missing"
            )
            db.add(log)
            db.commit()
            print(f"  [!] Reminder sent for {brand.name} — missing: {missing}")

        except Exception as e:
            print(f"  [✗] Reminder error for {brand_data['name']}: {e}")

    db.close()
    print(f"[ReminderJob] Done.\n")
