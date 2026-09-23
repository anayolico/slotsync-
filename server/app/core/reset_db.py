"""
SlotSync Database Reset and Wipe Utility.
Drops all existing data/tables and re-creates clean tables and migrations.
"""
import asyncio
import sys
import argparse
from sqlalchemy import text
from app.core.database import engine, Base
import app.models  # Ensure all models are registered on Base.metadata
from app.core.migrate import run_migrations


async def reset_database(confirm: bool = False):
    db_url_str = str(engine.url)
    # Mask password for display
    masked_url = engine.url.render_as_string(hide_password=True)
    
    print("\n==================================================")
    print("           SLOTSYNC DATABASE RESET TOOL           ")
    print("==================================================")
    print(f"Target Database: {masked_url}")
    print("WARNING: This will permanently delete all data in the database!")
    print("==================================================\n")

    if not confirm:
        try:
            user_input = input("Are you sure you want to clear the entire database? (type 'yes' to proceed): ").strip().lower()
            if user_input not in ["yes", "y"]:
                print("[-] Database reset cancelled by user.")
                return False
        except (KeyboardInterrupt, EOFError):
            print("\n[-] Operation cancelled.")
            return False

    print("\n[*] Starting database wipe...")
    is_postgres = "postgresql" in db_url_str

    async with engine.begin() as conn:
        if is_postgres:
            print("[*] PostgreSQL detected: Dropping and recreating public schema...")
            await conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
            await conn.execute(text("CREATE SCHEMA public;"))
            await conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
            print("[+] Public schema recreated.")
        else:
            print("[*] Dropping all tables...")
            await conn.run_sync(Base.metadata.drop_all)
            print("[+] All tables dropped.")

        print("[*] Recreating all base tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("[+] All tables recreated successfully.")

    print("\n[*] Running schema migrations & column verifications...")
    await run_migrations()

    print("\n==================================================")
    print("[SUCCESS] Database has been completely reset and is ready for fresh data!")
    print("==================================================\n")
    return True


def main():
    parser = argparse.ArgumentParser(description="Reset and clear the SlotSync database.")
    parser.add_argument(
        "--confirm",
        action="store_true",
        help="Bypass interactive confirmation prompt."
    )
    args = parser.parse_args()
    asyncio.run(reset_database(confirm=args.confirm))


if __name__ == "__main__":
    main()
