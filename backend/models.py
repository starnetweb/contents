from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


def gen_id():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id        = Column(String, primary_key=True, default=gen_id)
    name      = Column(String, nullable=False)
    email     = Column(String, unique=True, nullable=False)
    password  = Column(String, nullable=False)
    role      = Column(String, default="creator")   # admin | creator
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    telegram_chat_id  = Column(String, nullable=True)   # set after user connects bot
    telegram_token    = Column(String, nullable=True)   # one-time link token
    access_slug       = Column(String, nullable=True, unique=True)  # unique URL token


class Brand(Base):
    __tablename__ = "brands"

    id              = Column(String, primary_key=True, default=gen_id)
    name            = Column(String, nullable=False)
    slug            = Column(String, unique=True, nullable=False)
    description     = Column(String, nullable=False)
    website         = Column(String, nullable=False)
    niche           = Column(String, nullable=False)
    target_audience = Column(String, nullable=False)
    platforms       = Column(Text, nullable=False)        # JSON list
    telegram_chat_id = Column(String, nullable=True)
    is_active        = Column(Boolean, default=True)
    custom_prompt    = Column(Text, nullable=True)   # optional per-brand content instructions
    created_at       = Column(DateTime, server_default=func.now())

    content_days = relationship("ContentDay", back_populates="brand")
    post_links   = relationship("PostLink", back_populates="brand")
    scores       = relationship("Score", back_populates="brand")


class ContentDay(Base):
    __tablename__ = "content_days"

    id           = Column(String, primary_key=True, default=gen_id)
    brand_id     = Column(String, ForeignKey("brands.id"), nullable=False)
    for_date     = Column(DateTime, nullable=False)   # date content is to be posted
    content      = Column(Text, nullable=False)       # JSON: list of content cards
    news_context = Column(Text, nullable=True)        # JSON: news items used
    status       = Column(String, default="draft")    # draft | approved | sent
    generated_at = Column(DateTime, server_default=func.now())

    brand      = relationship("Brand", back_populates="content_days")
    post_links = relationship("PostLink", back_populates="content_day")


class PostLink(Base):
    __tablename__ = "post_links"

    id             = Column(String, primary_key=True, default=gen_id)
    brand_id       = Column(String, ForeignKey("brands.id"), nullable=False)
    content_day_id = Column(String, ForeignKey("content_days.id"), nullable=False)
    platform       = Column(String, nullable=False)   # instagram|facebook|twitter|tiktok|youtube
    url            = Column(String, nullable=False)
    submitted_at   = Column(DateTime, server_default=func.now())
    submitted_by   = Column(String, ForeignKey("users.id"), nullable=True)

    brand        = relationship("Brand", back_populates="post_links")
    content_day  = relationship("ContentDay", back_populates="post_links")
    metrics      = relationship("PostMetric", back_populates="post_link")


class PostMetric(Base):
    __tablename__ = "post_metrics"

    id          = Column(String, primary_key=True, default=gen_id)
    post_link_id = Column(String, ForeignKey("post_links.id"), nullable=False)
    likes       = Column(Integer, default=0)
    comments    = Column(Integer, default=0)
    shares      = Column(Integer, default=0)
    saves       = Column(Integer, default=0)
    reach       = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    followers   = Column(Integer, default=0)
    fetched_at  = Column(DateTime, server_default=func.now())

    post_link = relationship("PostLink", back_populates="metrics")


class Score(Base):
    __tablename__ = "scores"

    id         = Column(String, primary_key=True, default=gen_id)
    brand_id   = Column(String, ForeignKey("brands.id"), nullable=False)
    period     = Column(String, nullable=False)       # daily | weekly | monthly
    period_key = Column(String, nullable=False)       # 2025-01-20 | 2025-W03 | 2025-01
    score      = Column(Float, default=0.0)           # 0–100
    breakdown  = Column(Text, nullable=True)          # JSON
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    brand = relationship("Brand", back_populates="scores")


class ReminderLog(Base):
    __tablename__ = "reminder_logs"

    id       = Column(String, primary_key=True, default=gen_id)
    brand_id = Column(String, nullable=False)
    for_date = Column(DateTime, nullable=False)
    sent_at  = Column(DateTime, server_default=func.now())
    type     = Column(String, nullable=False)   # link_missing | content_sent
