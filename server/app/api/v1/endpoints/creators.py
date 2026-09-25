from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.creator import CreatorProfile
from app.models.user import User, UserRole
from app.schemas.creator import CreatorProfileCreate, CreatorProfileUpdate, CreatorProfileResponse

router = APIRouter()


@router.get("", response_model=List[CreatorProfileResponse])
async def list_creators(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    List active creators, optionally filtered by category (e.g. Doctor, Lawyer, Barber).
    """
    stmt = select(CreatorProfile).options(selectinload(CreatorProfile.user)).where(CreatorProfile.is_active == True)
    if category:
        stmt = stmt.where(CreatorProfile.category.ilike(f"%{category}%"))

    result = await db.execute(stmt)
    creators = result.scalars().all()
    return creators


@router.get("/categories", response_model=List[str])
async def list_creator_categories(
    db: AsyncSession = Depends(get_db),
):
    """
    List all distinct categories used across active creator profiles.
    """
    stmt = (
        select(CreatorProfile.category)
        .where(CreatorProfile.is_active == True)
        .group_by(CreatorProfile.category)
        .order_by(CreatorProfile.category)
    )
    result = await db.execute(stmt)
    categories = [cat for cat in result.scalars().all() if cat]
    return categories


@router.get("/{creator_id}", response_model=CreatorProfileResponse)
async def get_creator(
    creator_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get detailed public profile of a creator by ID.
    """
    stmt = select(CreatorProfile).options(selectinload(CreatorProfile.user)).where(CreatorProfile.id == creator_id)
    result = await db.execute(stmt)
    creator = result.scalar_one_or_none()

    if not creator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator not found.")

    return creator


@router.put("/me", response_model=CreatorProfileResponse)
async def update_my_creator_profile(
    data: CreatorProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update creator profile for the logged in creator user.
    """
    if current_user.role != UserRole.CREATOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creator accounts can manage creator profiles.",
        )

    stmt = select(CreatorProfile).options(selectinload(CreatorProfile.user)).where(CreatorProfile.user_id == current_user.id)
    result = await db.execute(stmt)
    creator = result.scalar_one_or_none()

    if not creator:
        creator = CreatorProfile(user_id=current_user.id, category=data.category or "General")
        db.add(creator)

    update_dict = data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(creator, field, value)

    await db.commit()
    await db.refresh(creator)
    return creator


@router.put("/{creator_id}", response_model=CreatorProfileResponse)
async def update_creator_profile_admin(
    creator_id: str,
    data: CreatorProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update creator profile by creator_id (Admin capability).
    """
    stmt = select(CreatorProfile).options(selectinload(CreatorProfile.user)).where(CreatorProfile.id == creator_id)
    result = await db.execute(stmt)
    creator = result.scalar_one_or_none()

    if not creator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator profile not found.")

    update_dict = data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(creator, field, value)

    await db.commit()
    await db.refresh(creator)
    return creator
