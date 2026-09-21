from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.creator import CreatorProfile
from app.models.user import User, UserRole
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentStatusUpdate,
)
from app.services.appointment_service import create_appointment
from app.services.notification_service import send_push_notification

router = APIRouter()


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Book an appointment slot with a creator. Triggers instant FCM push notification to creator.
    """
    appointment = await create_appointment(db=db, client=current_user, data=data)

    # Reload with relationships
    stmt = (
        select(Appointment)
        .options(
            selectinload(Appointment.client),
            selectinload(Appointment.creator).selectinload(CreatorProfile.user),
        )
        .where(Appointment.id == appointment.id)
    )
    res = await db.execute(stmt)
    return res.scalar_one()


@router.get("/me", response_model=List[AppointmentResponse])
async def get_my_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all relevant appointments for the logged-in user (Client bookings or Creator schedule).
    """
    if current_user.role == UserRole.CREATOR:
        creator_res = await db.execute(select(CreatorProfile).where(CreatorProfile.user_id == current_user.id))
        creator = creator_res.scalar_one_or_none()
        if creator:
            stmt = (
                select(Appointment)
                .options(
                    selectinload(Appointment.client),
                    selectinload(Appointment.creator).selectinload(CreatorProfile.user),
                )
                .where(Appointment.creator_id == creator.id)
                .order_by(Appointment.start_time_utc.desc())
            )
            res = await db.execute(stmt)
            return res.scalars().all()

    stmt = (
        select(Appointment)
        .options(
            selectinload(Appointment.client),
            selectinload(Appointment.creator).selectinload(CreatorProfile.user),
        )
        .where(Appointment.client_id == current_user.id)
        .order_by(Appointment.start_time_utc.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("", response_model=List[AppointmentResponse])
@router.get("/my-bookings", response_model=List[AppointmentResponse])
async def list_my_client_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all appointments booked by the current user (Client view).
    """
    stmt = (
        select(Appointment)
        .options(
            selectinload(Appointment.client),
            selectinload(Appointment.creator).selectinload(CreatorProfile.user),
        )
        .where(Appointment.client_id == current_user.id)
        .order_by(Appointment.start_time_utc.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/creator-schedule", response_model=List[AppointmentResponse])
async def list_creator_schedule(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all client bookings for the logged-in creator.
    """
    if current_user.role != UserRole.CREATOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can access creator schedule.",
        )

    creator_res = await db.execute(select(CreatorProfile).where(CreatorProfile.user_id == current_user.id))
    creator = creator_res.scalar_one_or_none()
    if not creator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator profile not found.")

    stmt = (
        select(Appointment)
        .options(
            selectinload(Appointment.client),
            selectinload(Appointment.creator).selectinload(CreatorProfile.user),
        )
        .where(Appointment.creator_id == creator.id)
        .order_by(Appointment.start_time_utc.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: str,
    data: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update appointment status (CANCELLED, COMPLETED, REJECTED, CONFIRMED).
    Sends notification to client when status changes.
    """
    stmt = (
        select(Appointment)
        .options(
            selectinload(Appointment.client),
            selectinload(Appointment.creator).selectinload(CreatorProfile.user),
        )
        .where(Appointment.id == appointment_id)
    )
    res = await db.execute(stmt)
    appointment = res.scalar_one_or_none()

    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    # Check permission: must be client or creator of this appointment
    if appointment.client_id != current_user.id and (not appointment.creator or appointment.creator.user_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

    appointment.status = data.status
    await db.commit()
    await db.refresh(appointment)

    # Trigger notification to client if status updated
    notify_user_id = appointment.client_id if current_user.id != appointment.client_id else (appointment.creator.user_id if appointment.creator else None)
    if notify_user_id:
        await send_push_notification(
            db=db,
            user_id=notify_user_id,
            title="Appointment Update",
            body=f"Your appointment status has been updated to {data.status.value}.",
            data={"appointment_id": str(appointment.id), "status": data.status.value},
        )

    return appointment
