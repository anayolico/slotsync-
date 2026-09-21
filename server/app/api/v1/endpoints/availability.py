from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.availability import AvailabilityRule
from app.models.creator import CreatorProfile
from app.models.user import User, UserRole
from app.schemas.availability import (
    AvailabilityRuleResponse,
    SetAvailabilityRequest,
    SlotResponse,
)
from app.services.slot_calculator import compute_available_slots

router = APIRouter()


@router.post("", response_model=List[AvailabilityRuleResponse])
async def set_creator_availability(
    data: SetAvailabilityRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Set weekly working hours for logged-in Creator. Replaces existing schedule.
    """
    if current_user.role != UserRole.CREATOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can set availability schedules.",
        )

    res = await db.execute(select(CreatorProfile).where(CreatorProfile.user_id == current_user.id))
    creator = res.scalar_one_or_none()
    if not creator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator profile not found.")

    # Delete existing rules
    await db.execute(delete(AvailabilityRule).where(AvailabilityRule.creator_id == creator.id))

    new_rules = []
    for item in data.rules:
        rule = AvailabilityRule(
            creator_id=creator.id,
            day_of_week=item.day_of_week,
            start_time=item.start_time,
            end_time=item.end_time,
        )
        db.add(rule)
        new_rules.append(rule)

    await db.commit()
    for r in new_rules:
        await db.refresh(r)

    return new_rules


@router.get("", response_model=List[AvailabilityRuleResponse])
@router.get("/me", response_model=List[AvailabilityRuleResponse])
async def get_my_availability(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get working hours schedule for logged in Creator.
    """
    res = await db.execute(select(CreatorProfile).where(CreatorProfile.user_id == current_user.id))
    creator = res.scalar_one_or_none()
    if not creator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator profile not found.")

    rules_res = await db.execute(select(AvailabilityRule).where(AvailabilityRule.creator_id == creator.id))
    return rules_res.scalars().all()


@router.get("/{creator_id}/rules", response_model=List[AvailabilityRuleResponse])
async def get_creator_availability_rules_admin(
    creator_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get all working hours rules for a target creator by creator_id.
    """
    rules_res = await db.execute(select(AvailabilityRule).where(AvailabilityRule.creator_id == creator_id))
    return rules_res.scalars().all()


@router.post("/{creator_id}/rules", response_model=List[AvailabilityRuleResponse])
async def set_creator_availability_rules_admin(
    creator_id: str,
    data: SetAvailabilityRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Set or edit weekly working hours for any target creator by creator_id (Admin access).
    """
    res = await db.execute(select(CreatorProfile).where(CreatorProfile.id == creator_id))
    creator = res.scalar_one_or_none()
    if not creator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator profile not found.")

    # Replace existing rules
    await db.execute(delete(AvailabilityRule).where(AvailabilityRule.creator_id == creator.id))

    new_rules = []
    for item in data.rules:
        rule = AvailabilityRule(
            creator_id=creator.id,
            day_of_week=item.day_of_week,
            start_time=item.start_time,
            end_time=item.end_time,
        )
        db.add(rule)
        new_rules.append(rule)

    await db.commit()
    for r in new_rules:
        await db.refresh(r)

    return new_rules


@router.get("/{creator_id}/slots", response_model=List[SlotResponse])
async def get_creator_slots(
    creator_id: str,
    date_str: date = Query(..., alias="date", description="Target date in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get dynamic list of open, non-overlapping available appointment slots for a target date in UTC.
    """
    slots = await compute_available_slots(db=db, creator_id=creator_id, target_date=date_str)
    return slots
