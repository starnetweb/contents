"""
APScheduler setup — all scheduled jobs for the content agent.
All times are in Africa/Lagos (WAT = UTC+1).
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

WAT = pytz.timezone("Africa/Lagos")
scheduler = BackgroundScheduler(timezone=WAT)


def start_scheduler():
    from jobs.content_job import run_content_generation
    from jobs.reminder_job import run_reminder_check
    from jobs.scoring_job import run_scoring

    # 5:00 PM WAT — Search web + generate content for all brands
    scheduler.add_job(
        run_content_generation,
        CronTrigger(hour=17, minute=0, timezone=WAT),
        id="content_generation",
        replace_existing=True,
        name="Generate daily content for all brands"
    )

    # 5:30 PM WAT — Send content calendar via Telegram
    scheduler.add_job(
        run_telegram_send,
        CronTrigger(hour=17, minute=30, timezone=WAT),
        id="telegram_send",
        replace_existing=True,
        name="Send content calendar to Telegram"
    )

    # 4:00 PM WAT — Check for missing post links, send reminders
    scheduler.add_job(
        run_reminder_check,
        CronTrigger(hour=16, minute=0, timezone=WAT),
        id="reminder_check",
        replace_existing=True,
        name="Send reminders for missing post links"
    )

    # Every hour — Update scores for all brands
    scheduler.add_job(
        run_scoring,
        CronTrigger(minute=0, timezone=WAT),
        id="scoring",
        replace_existing=True,
        name="Hourly score update"
    )

    scheduler.start()
    print("[OK] Scheduler started (Africa/Lagos timezone)")
    print("   * 5:00 PM  -- Content generation")
    print("   * 5:30 PM  -- Telegram delivery")
    print("   * 4:00 PM  -- Reminder check")
    print("   * Every hr -- Score updates")


def run_telegram_send():
    from jobs.content_job import send_todays_content
    send_todays_content()
