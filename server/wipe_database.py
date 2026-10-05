"""
Temporary Database Wipe Script for SlotSync.
Deletes all records and information from the database upon deployment.
Once completed, this file can be deleted and pushed again to resume normal operations.
"""
import os
import sys
import asyncio
import logging
from sqlalchemy import text, inspect

# Ensure server directory is on sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.core.database import engine, Base
import app.models  # Ensure all model tables are registered

logger = logging.getLogger("slotsync.wipe")


async def run_database_wipe():
    """
    Wipes all data from every table in the database.
    Safe for both SQLite and PostgreSQL.
    """
    print("\n" + "=" * 65)
    print("🚨 [DATABASE WIPE] Initiating complete database wipe on server...")
    print("=" * 65)

    try:
        async with engine.begin() as conn:
            # 1. Determine database dialect
            dialect = engine.dialect.name.lower()
            print(f"ℹ️ [DATABASE WIPE] Detected database engine: {dialect}")

            # 2. Get list of existing tables
            def get_tables(connection):
                inspector = inspect(connection)
                return inspector.get_table_names()

            tables = await conn.run_sync(get_tables)
            print(f"📋 [DATABASE WIPE] Existing tables found: {tables}")

            if "postgres" in dialect:
                # PostgreSQL: TRUNCATE with CASCADE resets all rows and foreign keys cleanly
                if tables:
                    quoted_tables = ", ".join([f'"{t}"' for t in tables])
                    print(f"⚡ [DATABASE WIPE] Truncating PostgreSQL tables: {quoted_tables}")
                    await conn.execute(text(f"TRUNCATE TABLE {quoted_tables} RESTART IDENTITY CASCADE;"))
            else:
                # SQLite / other: Disable foreign keys, delete all rows, reset autoincrement sequence
                print("⚡ [DATABASE WIPE] Disabling foreign keys and deleting records...")
                await conn.execute(text("PRAGMA foreign_keys = OFF;"))
                for t in tables:
                    await conn.execute(text(f'DELETE FROM "{t}";'))
                    print(f"   ✓ Wiped table: {t}")
                try:
                    await conn.execute(text("DELETE FROM sqlite_sequence;"))
                except Exception:
                    pass
                await conn.execute(text("PRAGMA foreign_keys = ON;"))

            print("=" * 65)
            print("✅ [DATABASE WIPE] ALL DATABASE INFORMATION HAS BEEN PERMANENTLY WIPED.")
            print("   The database is now completely clean and empty.")
            print("=" * 65 + "\n")

    except Exception as e:
        print(f"❌ [DATABASE WIPE] Error during database wipe: {e}")
        logger.error(f"Database wipe failed: {e}", exc_info=True)
        raise e


if __name__ == "__main__":
    asyncio.run(run_database_wipe())
