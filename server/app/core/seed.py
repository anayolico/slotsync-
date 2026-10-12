import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash


async def seed_admin():
    """
    Ensure the default admin user exists with ADMIN role and verified status.
    """
    email = "acnwa1234@gmail.com"
    password = "Anayolico_1992...."
    full_name = "SlotSync Admin"

    print(f"[Seed] Checking admin user for: {email}...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            user.hashed_password = get_password_hash(password)
            user.role = UserRole.ADMIN
            user.is_verified = True
            await session.commit()
            print(f"[Seed] Admin user '{email}' already exists. Password and ADMIN role updated successfully.")
        else:
            new_admin = User(
                id=str(uuid.uuid4()),
                email=email,
                hashed_password=get_password_hash(password),
                full_name=full_name,
                role=UserRole.ADMIN,
                is_verified=True,
                created_at=datetime.now(timezone.utc),
            )
            session.add(new_admin)
            await session.commit()
            print(f"[Seed] Admin user '{email}' successfully created with ADMIN role!")
