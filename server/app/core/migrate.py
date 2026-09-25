"""
Database Migration & Auto-Sync Script for SlotSync Backend.
Ensures all tables and columns defined in SQLAlchemy models are registered and present in the database.
Runs automatically on FastAPI application startup (lifespan hook), ensuring seamless migrations
on VPS deployment, Docker restart, or local development without manual intervention.
"""
import asyncio
import logging
from sqlalchemy import text, inspect
from app.core.database import engine, Base
import app.models  # Ensure all models are registered with Base.metadata

logger = logging.getLogger("slotsync.migrate")


async def run_migrations():
    """
    Auto-synchronize database schema with SQLAlchemy models.
    Creates missing tables and adds missing columns dynamically.
    """
    print("[Migration] Starting database schema synchronization...")
    async with engine.begin() as conn:
        # 1. Create any missing tables defined in Base.metadata
        await conn.run_sync(Base.metadata.create_all)
        print("[Migration] Tables verified and created in database.")

        # 2. Inspect and auto-add missing columns to existing tables
        def sync_columns(connection):
            inspector = inspect(connection)
            table_names = inspector.get_table_names()

            # Columns to verify and ensure exist on 'users'
            if "users" in table_names:
                existing_user_cols = {col["name"] for col in inspector.get_columns("users")}
                user_columns = [
                    ("gender", "VARCHAR(20)"),
                    ("date_of_birth", "VARCHAR(30)"),
                    ("marital_status", "VARCHAR(30)"),
                    ("avatar_url", "VARCHAR(500)"),
                    ("phone_number", "VARCHAR(30)"),
                ]
                for col_name, col_type in user_columns:
                    if col_name not in existing_user_cols:
                        try:
                            connection.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                            print(f"[Migration] Successfully added column '{col_name}' to 'users' table.")
                        except Exception as e:
                            print(f"[Migration] Notice adding '{col_name}' to 'users': {e}")

            # Columns to verify on 'creator_profiles'
            if "creator_profiles" in table_names:
                existing_creator_cols = {col["name"] for col in inspector.get_columns("creator_profiles")}
                creator_columns = [
                    ("slot_duration_minutes", "INTEGER DEFAULT 30"),
                    ("hourly_rate", "FLOAT DEFAULT 0.0"),
                    ("currency", "VARCHAR(10) DEFAULT 'NGN'"),
                    ("bio", "TEXT"),
                    ("title", "VARCHAR(150)"),
                    ("category", "VARCHAR(100)"),
                    ("is_active", "BOOLEAN DEFAULT TRUE"),
                ]
                for col_name, col_type in creator_columns:
                    if col_name not in existing_creator_cols:
                        try:
                            connection.execute(text(f"ALTER TABLE creator_profiles ADD COLUMN {col_name} {col_type}"))
                            print(f"[Migration] Successfully added column '{col_name}' to 'creator_profiles' table.")
                        except Exception as e:
                            print(f"[Migration] Notice adding '{col_name}' to 'creator_profiles': {e}")

            # Columns to verify on 'appointments'
            if "appointments" in table_names:
                existing_appt_cols = {col["name"] for col in inspector.get_columns("appointments")}
                appt_columns = [
                    ("notes", "TEXT"),
                    ("status", "VARCHAR(30) DEFAULT 'PENDING'"),
                ]
                for col_name, col_type in appt_columns:
                    if col_name not in existing_appt_cols:
                        try:
                            connection.execute(text(f"ALTER TABLE appointments ADD COLUMN {col_name} {col_type}"))
                            print(f"[Migration] Successfully added column '{col_name}' to 'appointments' table.")
                        except Exception as e:
                            print(f"[Migration] Notice adding '{col_name}' to 'appointments': {e}")

        await conn.run_sync(sync_columns)
        logger.info("[Migration] Database schema synchronization complete.")


if __name__ == "__main__":
    asyncio.run(run_migrations())
