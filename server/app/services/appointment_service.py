from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.creator import CreatorProfile
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User
from app.models.notification import InAppNotification
from app.schemas.appointment import AppointmentCreate
from app.services.notification_service import send_push_notification


def _ensure_utc(dt: datetime) -> datetime:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


async def create_appointment(
    db: AsyncSession,
    client: User,
    data: AppointmentCreate,
) -> Appointment:
    """
    Atomically books an appointment and notifies the creator via push notification.
    """
    # 1. Fetch Creator
    creator_res = await db.execute(select(CreatorProfile).where(CreatorProfile.id == data.creator_id))
    creator = creator_res.scalar_one_or_none()
    if not creator or not creator.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator profile not found or inactive.")

    if creator.user_id == client.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot book an appointment with yourself.")

    # 2. Ensure start_time_utc is timezone-aware UTC
    start_dt = _ensure_utc(data.start_time_utc)
    now_utc = datetime.now(timezone.utc)

    if start_dt < now_utc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot book an appointment in the past.")

    end_dt = start_dt + timedelta(minutes=creator.slot_duration_minutes)

    # 3. Conflict Check (Overlap validation)
    appts_res = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.creator_id == data.creator_id,
                Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
            )
        )
    )
    existing_appts = appts_res.scalars().all()

    for appt in existing_appts:
        appt_start = _ensure_utc(appt.start_time_utc)
        appt_end = _ensure_utc(appt.end_time_utc)
        if appt_start < end_dt and appt_end > start_dt:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Selected slot has already been booked by another user.",
            )

    # 4. Create appointment instance with PENDING status (awaiting creator confirmation)
    appointment = Appointment(
        client_id=client.id,
        creator_id=data.creator_id,
        start_time_utc=start_dt,
        end_time_utc=end_dt,
        status=AppointmentStatus.PENDING,
        notes=data.notes,
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)

    # 5. In-App Notification record for Creator
    formatted_start = start_dt.strftime("%b %d, %Y at %H:%M UTC")
    in_app_notif = InAppNotification(
        user_id=creator.user_id,
        title="New Booking Request",
        message=f"{client.full_name} has requested a {creator.slot_duration_minutes}-minute session for {formatted_start}.",
        type="BOOKING_REQUEST",
        appointment_id=str(appointment.id),
        is_read=False,
    )
    db.add(in_app_notif)
    await db.commit()

    # 6. Send FCM Push Notification to Creator
    await send_push_notification(
        db=db,
        user_id=creator.user_id,
        title="🔔 New Booking Request",
        body=f"{client.full_name} has requested a {creator.slot_duration_minutes}-minute session for {formatted_start}. Open app to Accept or Decline.",
        data={
            "appointment_id": str(appointment.id),
            "client_name": client.full_name,
            "start_time": start_dt.isoformat(),
            "type": "NEW_BOOKING_REQUEST",
            "status": "PENDING",
        },
    )

    return appointment
