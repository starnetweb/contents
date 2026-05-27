"""
Telegram delivery service.
Sends formatted content calendars and reminders to brand channels.
"""
import os
import asyncio
from pathlib import Path
from telegram import Bot
from telegram.constants import ParseMode
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env", override=True)

bot = Bot(token=os.getenv("TELEGRAM_BOT_TOKEN"))

PLATFORM_EMOJI = {
    "instagram": "📸",
    "facebook": "📘",
    "tiktok": "🎵",
    "youtube": "▶️",
    "twitter": "🐦",
}

TYPE_EMOJI = {
    "carousel": "🖼️",
    "video": "🎬",
    "post": "📝",
}


def format_content_card(card: dict) -> str:
    """Format a single content card as a Telegram message."""
    platform = card.get("platform", "").upper()
    p_emoji = PLATFORM_EMOJI.get(card.get("platform", ""), "📱")
    t_emoji = TYPE_EMOJI.get(card.get("type", ""), "📄")
    lines = []

    lines.append(f"{p_emoji} *{platform}* — {t_emoji} {card.get('type', '').title()}")
    lines.append(f"⏰ *Post Time:* {card.get('posting_time', 'TBD')}")
    lines.append(f"\n💡 *Idea:* {card.get('idea', '')}")
    lines.append(f"\n🎯 *Hook:*\n_{card.get('hook', '')}_")

    if card.get("type") == "carousel":
        slides = card.get("slides", [])
        if slides:
            lines.append("\n📋 *Slides:*")
            for s in slides:
                lines.append(f"  Slide {s['slide']}: *{s['heading']}*\n  {s['body']}")

    elif card.get("type") == "video":
        script = card.get("script", "")
        if script:
            lines.append(f"\n🎬 *Script:*\n{script[:600]}{'...' if len(script) > 600 else ''}")

    elif card.get("type") == "post":
        thread = card.get("thread", [])
        if thread:
            lines.append("\n🧵 *Thread:*")
            for i, tweet in enumerate(thread, 1):
                lines.append(f"  {i}. {tweet}")

    lines.append(f"\n📝 *Caption:*\n{card.get('caption', '')[:400]}")
    lines.append(f"\n📢 *CTA:* {card.get('cta', '')}")
    lines.append(f"\n🎨 *Cover Prompt:*\n_{card.get('cover_prompt', '')[:300]}_")

    hashtags = " ".join(card.get("hashtags", []))
    lines.append(f"\n🏷️ {hashtags}")

    return "\n".join(lines)


async def send_content_calendar(brand_name: str, chat_id: str, cards: list[dict], for_date: str):
    """Send full content calendar for a brand to its Telegram channel."""
    if not chat_id:
        print(f"[Telegram] No chat ID for {brand_name}, skipping.")
        return

    central_idea = cards[0].get("central_idea", "") if cards else ""
    news_source = cards[0].get("news_source", "") if cards else ""
    header = (
        f"🗓️ *CONTENT CALENDAR — {brand_name.upper()}*\n"
        f"📅 *For:* {for_date}\n"
        f"{'─' * 30}\n"
        f"💡 *Today's Angle:* {central_idea}\n"
        f"📰 *Source:* {news_source}"
    )
    await bot.send_message(chat_id=chat_id, text=header, parse_mode=ParseMode.MARKDOWN)

    for card in cards:
        try:
            msg = format_content_card(card)
            await bot.send_message(chat_id=chat_id, text=msg, parse_mode=ParseMode.MARKDOWN)
            await asyncio.sleep(0.5)  # avoid rate limits
        except Exception as e:
            print(f"[Telegram] Error sending card for {brand_name}/{card.get('platform')}: {e}")

    footer = f"✅ *{len(cards)} platforms covered* | Review & approve on dashboard"
    await bot.send_message(chat_id=chat_id, text=footer, parse_mode=ParseMode.MARKDOWN)


async def send_reminder(brand_name: str, chat_id: str, missing_platforms: list[str], for_date: str):
    """Send a reminder to submit post links for a brand."""
    if not chat_id:
        return

    platforms_list = "\n".join([f"  • {p.title()}" for p in missing_platforms])
    msg = (
        f"⚠️ *REMINDER — {brand_name.upper()}*\n\n"
        f"Post links are missing for *{for_date}*!\n\n"
        f"Missing platforms:\n{platforms_list}\n\n"
        f"🔗 Please submit your post links on the dashboard before *5:00 PM* today.\n"
        f"Dashboard: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}"
    )
    try:
        await bot.send_message(chat_id=chat_id, text=msg, parse_mode=ParseMode.MARKDOWN)
    except Exception as e:
        print(f"[Telegram] Reminder error for {brand_name}: {e}")


def run_async(coro):
    """Helper to run async telegram functions from sync context."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, coro)
                return future.result()
        else:
            return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)
