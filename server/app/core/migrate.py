"""
Database Migration & Auto-Sync Script for SlotSync VPS Backend.
Safely creates missing tables and adds missing columns without losing existing records.
"""
import asyncio
import sys
from sqlalchemy import text
from app.core.database import engine, Base
import app.models  # Ensure all models are registered with Base.metadata


async def run_migrations():
    print("[MIGRATION] Starting SlotSync Database Migration...")

    async with engine.begin() as conn:
        # 1. Create all missing tables (e.g., email_verifications, users, creator_profiles, etc.)
        await conn.run_sync(Base.metadata.create_all)
        print("[MIGRATION] Base tables created / verified.")

        # 2. Check and add missing columns to users table
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN phone_number VARCHAR(50)"))
            print("  + Added 'phone_number' column to users.")
        except Exception:
            pass

        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0"))
            print("  + Added 'is_verified' column to users.")
        except Exception:
            pass

        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)"))
            print("  + Added 'google_id' column to users.")
        except Exception:
            pass

        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)"))
            print("  + Added 'avatar_url' column to users.")
        except Exception:
            pass

        # 3. Check and add missing columns to creator_profiles table
        try:
            await conn.execute(text("ALTER TABLE creator_profiles ADD COLUMN phone_number VARCHAR(50)"))
            print("  + Added 'phone_number' column to creator_profiles.")
        except Exception:
            pass

        try:
            await conn.execute(text("ALTER TABLE creator_profiles ADD COLUMN consultation_mode VARCHAR(50) DEFAULT 'VIRTUAL'"))
            print("  + Added 'consultation_mode' column to creator_profiles.")
        except Exception:
            pass

        try:
            await conn.execute(text("ALTER TABLE creator_profiles ADD COLUMN office_address VARCHAR(255)"))
            print("  + Added 'office_address' column to creator_profiles.")
        except Exception:
            pass

        try:
            await conn.execute(text("ALTER TABLE creator_profiles ADD COLUMN currency VARCHAR(10) DEFAULT 'USD'"))
            print("  + Added 'currency' column to creator_profiles.")
        except Exception:
            pass

    print("[MIGRATION] Database migration completed successfully!")


if __name__ == "__main__":
    asyncio.run(run_migrations())
