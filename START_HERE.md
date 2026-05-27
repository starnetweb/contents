# Content Agent — Local Setup Guide

## Prerequisites
- Python 3.11+ → https://python.org
- Node.js 18+ → https://nodejs.org

---

## 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and fill in your credentials
copy .env.example .env
```

Edit `.env` and fill in:
- `ANTHROPIC_API_KEY` → https://console.anthropic.com
- `TAVILY_API_KEY` → https://tavily.com (free tier)
- `TELEGRAM_BOT_TOKEN` → from @BotFather on Telegram
- `TELEGRAM_*_CHAT_ID` → one per brand (see below)

### Getting Telegram Chat IDs
1. Add your bot to each brand's Telegram group
2. Send any message in the group
3. Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. Find the `"chat": {"id": ...}` value — that's the chat ID

### Seed the database
```bash
python data/seed.py
```
This creates all 6 brands and a default admin account:
- Email: `admin@contentagent.com`
- Password: `admin123`

### Start the backend
```bash
python main.py
```
API runs at: http://localhost:4000
API docs at: http://localhost:4000/docs

---

## 2. Dashboard Setup

```bash
cd dashboard
npm install
npm run dev
```
Dashboard runs at: http://localhost:3000

---

## 3. First Login
1. Go to http://localhost:3000
2. Login with `admin@contentagent.com` / `admin123`
3. **Change the password immediately** via the Users page
4. Create creator accounts for your team

---

## Scheduled Jobs (Automatic)
| Time (WAT) | Job |
|---|---|
| 5:00 PM | Search web + generate content for all 6 brands |
| 5:30 PM | Send content calendars to brand Telegram channels |
| 4:00 PM | Check for missing post links → send reminders |
| Every hour | Recalculate daily/weekly/monthly scores |

## Manual Triggers (Dashboard)
- Admin dashboard → **"⚡ Generate Now"** — trigger content generation instantly
- Admin dashboard → **"📤 Send to Telegram"** — send to Telegram now
- Admin dashboard → **"🔄 Recalculate"** — refresh all scores

---

## Scoring System
| Metric | Weight |
|---|---|
| Link submitted on time (before 4 PM) | 20 pts |
| Content posted on scheduled day | 30 pts |
| Engagement rate | 30 pts |
| Reach / impressions | 20 pts |
| **Total** | **100 pts** |

Scores are calculated: **Daily**, **Weekly** (avg of 7 days + consistency bonus), **Monthly** (avg + trend)
