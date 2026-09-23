"""
Database Migration & Auto-Sync Script for SlotSync Backend.
Ensures all tables defined in SQLAlchemy models are registered and present in the database.
"""
import asyncio
from app.core.database import engine, Base
import app.models  # Ensure all models are registered with Base.metadata


async def run_migrations():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    asyncio.run(run_migrations())
