"""
Content generation service using Claude API.

Strategy:
- ONE central idea per brand per day (based on today's news)
- That same idea is adapted into platform-specific content for each platform
- Format, tone, length and structure differ per platform — the TOPIC is the same
- Duplicate prevention: previously used ideas are passed in so Claude avoids them
"""
import os
import json
from pathlib import Path
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env", override=True)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are a world-class Nigerian social media content strategist.

Your job:
1. Pick ONE strong content idea for a brand based on today's news/trends
2. Adapt that SAME idea into platform-specific content for each platform
3. The TOPIC and CORE MESSAGE must be identical across platforms
4. But the FORMAT, TONE, LENGTH, and STYLE must be native to each platform

Platform format rules (NON-NEGOTIABLE):
- Instagram: Carousel (3 slides) — educational, saveable, clean design copy
- Facebook: Carousel (3 slides) — slightly longer, conversational, shareable
- TikTok: Video — hook in 1.5 seconds, casual/entertaining, 30-60s script
- YouTube: Video — slightly longer script, thumbnail-worthy, searchable title
- Twitter/X: Post/thread — punchy, max 280 chars per tweet, 2-3 tweet thread max

Tone per platform:
- Instagram: aspirational + educational, clean captions
- Facebook: friendly + relatable, community feel, tag-worthy
- TikTok: raw, entertaining, youth-coded, trending energy
- YouTube: informative, slightly formal, search-optimised
- Twitter/X: opinionated, punchy, hot-take energy, conversation starter

You must return ONLY valid JSON — no markdown, no explanation, just the JSON object."""


def generate_content_for_brand(
    brand: dict,
    news_items: list[dict],
    for_date: str,
    previous_ideas: list[str] = [],
    custom_prompt: str = ""
) -> list[dict]:
    """
    Generate one content idea adapted across all platforms for a brand.
    previous_ideas: list of idea summaries already used — Claude will avoid repeating them.
    """

    if news_items:
        news_summary = "\n".join([
            f"- [{item.get('published_date', 'today')}] {item['title']}: {item['content'][:250]}"
            for item in news_items[:6]
        ])
        news_instruction = "Pick ONE strong content idea inspired by today's news. The idea must connect the news to the brand's audience."
    else:
        news_summary = None
        news_instruction = (
            "No news search was done for this brand — generate a completely fresh, creative EVERGREEN content idea. "
            "Do NOT use news at all. Think: what useful, entertaining or inspiring angle about this brand's niche "
            "would resonate deeply with the target audience TODAY? Make it feel timely and original even without news. "
            "The idea must be different from all previously used ideas."
        )

    prev_ideas_text = ""
    if previous_ideas:
        prev_ideas_text = "\n\nPREVIOUSLY USED IDEAS (DO NOT REPEAT THESE):\n" + "\n".join(
            f"- {idea}" for idea in previous_ideas[-14:]  # last 2 weeks
        )

    platform_details = ""
    for platform, strategy in brand["platform_strategy"].items():
        platform_details += (
            f"\n  {platform.upper()}:\n"
            f"    Best post time: {strategy['best_times'][0]}\n"
            f"    Hashtags: {', '.join(strategy['hashtags'][:5])}\n"
            f"    Algorithm tip: {strategy['algorithm_note']}\n"
        )

    news_block = f"TODAY'S NEWS & TRENDS (last 24 hours):\n{news_summary}" if news_summary else "CONTENT STRATEGY: Evergreen — no news search. Generate a fresh original idea."

    user_prompt = f"""
Generate tomorrow's ({for_date}) content for this brand.

BRAND: {brand['name']}
DESCRIPTION: {brand['description']}
NICHE: {brand['niche']}
TARGET AUDIENCE: {brand['target_audience']}
WEBSITE: {brand['website']}
TONE: {brand['content_tone']}

{news_block}
{prev_ideas_text}

PLATFORM INTELLIGENCE:
{platform_details}

INSTRUCTIONS:
1. {news_instruction}
2. The idea must be fresh — not from the previously used list
3. Adapt it to ALL {len(brand['platforms'])} platforms: {', '.join(brand['platforms'])}
{f"4. ADDITIONAL BRAND INSTRUCTIONS (follow these carefully):{chr(10)}{custom_prompt}{chr(10)}" if custom_prompt else ""}
4. Same topic, same core message — but native format per platform
5. Use Nigerian English, local references, culturally relevant hooks
6. Make every hook STOP the scroll

Return a single JSON object with this structure:

{{
  "central_idea": "One sentence summary of today's content idea",
  "news_source": "Which news item inspired this (or 'evergreen')",
  "platforms": [
    {{
      "platform": "instagram",
      "type": "carousel",
      "hook": "Scroll-stopping opening line for slide 1",
      "slides": [
        {{"slide": 1, "heading": "Cover headline", "body": "Supporting cover text"}},
        {{"slide": 2, "heading": "Main point", "body": "Body copy"}},
        {{"slide": 3, "heading": "Takeaway / CTA", "body": "Closing copy"}}
      ],
      "caption": "Instagram caption (engaging, 150-200 chars + line breaks)",
      "cta": "Clear call to action",
      "cover_prompt": "Detailed AI image prompt for cover slide (Midjourney/DALL-E style, describe style, colors, composition)",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "posting_time": "08:00"
    }},
    {{
      "platform": "facebook",
      "type": "carousel",
      "hook": "Opening sentence that makes people stop scrolling",
      "slides": [
        {{"slide": 1, "heading": "Cover headline", "body": "Cover text"}},
        {{"slide": 2, "heading": "Main point", "body": "Body copy"}},
        {{"slide": 3, "heading": "Discussion prompt", "body": "Closing copy"}}
      ],
      "caption": "Facebook caption (longer, conversational, 200-300 chars)",
      "cta": "Comment/share CTA",
      "cover_prompt": "AI image prompt for cover slide",
      "hashtags": ["#tag1", "#tag2"],
      "posting_time": "10:00"
    }},
    {{
      "platform": "tiktok",
      "type": "video",
      "hook": "Exact words for first 1.5 seconds (make it provocative/surprising)",
      "script": "Full video script with [SCENE: description] and spoken dialogue. 30-60 seconds max.",
      "caption": "TikTok caption (short, punchy, max 100 chars)",
      "cta": "End-of-video CTA (spoken) + caption CTA",
      "cover_prompt": "Thumbnail image prompt (bold text overlay, eye-catching)",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"],
      "posting_time": "19:00"
    }},
    {{
      "platform": "youtube",
      "type": "video",
      "hook": "First 15 seconds script hook",
      "script": "Full YouTube Shorts or video script (60-90 seconds). Include [SCENE:] directions.",
      "caption": "YouTube video description (SEO-optimised, 200-300 chars with keywords)",
      "cta": "Subscribe/like/comment CTA",
      "cover_prompt": "YouTube thumbnail prompt (face expression, bold text, high contrast)",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "posting_time": "17:00"
    }},
    {{
      "platform": "twitter",
      "type": "post",
      "hook": "Opening tweet (must be a standalone statement — opinionated or surprising)",
      "thread": [
        "Tweet 1 — the hook/statement (max 280 chars)",
        "Tweet 2 — expand / evidence / context (max 280 chars)",
        "Tweet 3 — conclusion / CTA (max 280 chars)"
      ],
      "caption": "Single standalone tweet version (if thread is too much)",
      "cta": "Reply/retweet ask",
      "cover_prompt": "Graphic image prompt for tweet card",
      "hashtags": ["#tag1", "#tag2"],
      "posting_time": "09:00"
    }}
  ]
}}

Return ONLY the JSON object. No other text.
"""

    try:
        message = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=8000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}]
        )
        raw = message.content[0].text.strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        # If JSON was truncated, try to extract just the outer object
        if not raw.endswith("}"):
            # Find the last complete top-level closing brace
            depth = 0
            end_pos = -1
            for i, ch in enumerate(raw):
                if ch == "{":
                    depth += 1
                elif ch == "}":
                    depth -= 1
                    if depth == 0:
                        end_pos = i
            if end_pos > 0:
                raw = raw[:end_pos + 1]
                print(f"    [warn] JSON truncated — recovered up to char {end_pos}")

        result = json.loads(raw)
        central_idea = result.get("central_idea", "")
        news_source = result.get("news_source", "")
        cards = result.get("platforms", [])

        # Attach metadata to each card
        for card in cards:
            card["brand_slug"] = brand["slug"]
            card["brand_name"] = brand["name"]
            card["for_date"] = for_date
            card["central_idea"] = central_idea
            card["news_source"] = news_source

        print(f"    [idea] {central_idea}")
        print(f"    [source] {news_source}")
        return cards

    except json.JSONDecodeError as e:
        print(f"[ContentGen] JSON parse error for {brand['name']}: {e}")
        return []
    except Exception as e:
        print(f"[ContentGen] Error for {brand['name']}: {e}")
        return []
