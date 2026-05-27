"""
Run this once to seed the database with brands and default admin user.
Usage: python data/seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine
import models
from models import Brand, User
from data.brands import BRANDS
from passlib.context import CryptContext
import json

models.Base.metadata.create_all(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()


def seed_brands():
    for b in BRANDS:
        existing = db.query(Brand).filter(Brand.slug == b["slug"]).first()
        if not existing:
            brand = Brand(
                name=b["name"],
                slug=b["slug"],
                description=b["description"],
                website=b["website"],
                niche=b["niche"],
                target_audience=b["target_audience"],
                platforms=json.dumps(b["platforms"]),
                telegram_chat_id=os.getenv(b.get("telegram_env_key", ""), None)
            )
            db.add(brand)
            print(f"  [+] Seeded brand: {b['name']}")
        else:
            print(f"  [~] Brand already exists: {b['name']}")


def seed_admin():
    existing = db.query(User).filter(User.email == "admin@contentagent.com").first()
    if not existing:
        admin = User(
            name="Admin",
            email="admin@contentagent.com",
            password=pwd_context.hash("admin123"),
            role="admin"
        )
        db.add(admin)
        print("  [+] Seeded admin user: admin@contentagent.com / admin123")
    else:
        print("  [~] Admin user already exists")


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    print("\nSeeding database...\n")
    seed_brands()
    seed_admin()
    db.commit()
    db.close()
    print("\nSeed complete!\n")
