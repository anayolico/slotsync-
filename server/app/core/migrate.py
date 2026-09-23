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
        # 1. Create all missing tables (e.g. email_verifications)
        await conn.run_sync(Base.metadata.create_all)
        print("[MIGRATION] Base tables created / verified.")

        # Column list to ensure existence
        is_postgres = "postgresql" in str(engine.url)
        
        user_cols = [
            ("phone_number", "VARCHAR(50)"),
            ("is_verified", "BOOLEAN DEFAULT FALSE" if is_postgres else "BOOLEAN DEFAULT 0"),
            ("google_id", "VARCHAR(255)"),
            ("avatar_url", "VARCHAR(500)"),
        ]

        for col_name, col_type in user_cols:
            try:
                if is_postgres:
                    await conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                else:
                    await conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                print(f"  + Added/verified '{col_name}' column in users.")
            except Exception:
                pass

        creator_cols = [
            ("phone_number", "VARCHAR(50)"),
            ("consultation_mode", "VARCHAR(50) DEFAULT 'VIRTUAL'"),
            ("office_address", "VARCHAR(255)"),
            ("currency", "VARCHAR(10) DEFAULT 'USD'"),
        ]

        for col_name, col_type in creator_cols:
            try:
                if is_postgres:
                    await conn.execute(text(f"ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                else:
                    await conn.execute(text(f"ALTER TABLE creator_profiles ADD COLUMN {col_name} {col_type}"))
                print(f"  + Added/verified '{col_name}' column in creator_profiles.")
            except Exception:
                pass

    print("[MIGRATION] Database migration completed successfully!")


if __name__ == "__main__":
    asyncio.run(run_migrations())
