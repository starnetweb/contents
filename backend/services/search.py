"""
Tavily search service — fetches news from the last 24 hours per brand niche.
"""
import os
from pathlib import Path
from datetime import datetime, timedelta
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env", override=True)

client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


def search_brand_news(brand: dict, max_results: int = 7) -> list[dict]:
    """
    Search for news published in the last 24 hours relevant to a brand.
    Runs multiple keyword queries and deduplicates results.
    Returns a list of { title, url, content, published_date, score } dicts.
    """
    keywords = brand.get("search_keywords", [brand["niche"]])

    # Build two focused queries — primary + secondary keyword
    queries = [
        f"{keywords[0]} Nigeria today {datetime.now().strftime('%B %Y')}",
        f"{keywords[1] if len(keywords) > 1 else keywords[0]} Nigeria latest news today",
    ]

    seen_urls = set()
    all_results = []

    for query in queries:
        try:
            response = client.search(
                query=query,
                search_depth="advanced",
                max_results=max_results,
                include_answer=False,
                include_raw_content=False,
                days=1,          # ← LAST 24 HOURS ONLY
            )
            for r in response.get("results", []):
                url = r.get("url", "")
                if url in seen_urls:
                    continue
                seen_urls.add(url)

                # Filter out results with no published date or older than 48h as fallback
                all_results.append({
                    "title": r.get("title", ""),
                    "url": url,
                    "content": r.get("content", "")[:600],
                    "published_date": r.get("published_date", ""),
                    "score": r.get("score", 0),
                })
        except Exception as e:
            print(f"[Search] Error for brand {brand['name']} query '{query}': {e}")

    # Sort by relevance score, return top results
    all_results.sort(key=lambda x: x["score"], reverse=True)

    if not all_results:
        print(f"[Search] No 24h news for {brand['name']} — using evergreen fallback")

    return all_results[:max_results]
