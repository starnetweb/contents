import os
import sys
# Force UTF-8 output on Windows to handle emojis in logs
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine
import models

load_dotenv()

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Content Agent API",
    description="AI-powered social media content agent for 6 Nigerian brands",
    version="1.0.0"
)

# CORS
origins = [
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]
# Support multiple comma-separated origins in FRONTEND_URL
extra = os.getenv("EXTRA_ORIGINS", "")
if extra:
    origins += [o.strip() for o in extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from routers import auth, brands, content, links, scores
app.include_router(auth.router)
app.include_router(brands.router)
app.include_router(content.router)
app.include_router(links.router)
app.include_router(scores.router)


@app.on_event("startup")
def startup():
    from jobs.scheduler import start_scheduler
    start_scheduler()
    print("\n[OK] Content Agent API running")
    print(f"   Docs: http://localhost:{os.getenv('PORT', 4000)}/docs\n")


@app.get("/")
def root():
    return {"status": "ok", "message": "Content Agent API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 4000)), reload=True)
