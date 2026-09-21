from datetime import datetime, date, time, timedelta, timezone
from typing import List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.creator import CreatorProfile
from app.models.availability import AvailabilityRule
from app.models.appointment import Appointment, AppointmentStatus
from app.schemas.availability import SlotResponse


def _ensure_utc(dt: datetime) -> datetime:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


async def compute_available_slots(
    db: AsyncSession,
    creator_id: str,
    target_date: date,
) -> List[SlotResponse]:
    """
    Calculates open time slots for   a creator on a given date in UTC.
    """
    # 1. Fetch Creator profile
    creator_res = await db.execute(select(CreatorProfile).where(CreatorProfile.id == creator_id))
    creator = creator_res.scalar_one_or_none()
    if not creator or not creator.is_active:
        return []

    # 2. Get day of week (0 = Monday, ..., 6 = Sunday)
    day_of_week = target_date.weekday()

    # 3. Fetch Creator availability rules for this day
    rules_res = await db.execute(
        select(AvailabilityRule).where(
            and_(
                AvailabilityRule.creator_id == creator_id,
                AvailabilityRule.day_of_week == day_of_week,
            )
        )
    )
    rules = rules_res.scalars().all()
    if not rules:
        return []

    # 4. Fetch active appointments for target date (start of day to end of day in UTC)
    start_of_day = datetime.combine(target_date, time.min).replace(tzinfo=timezone.utc)
    end_of_day = datetime.combine(target_date, time.max).replace(tzinfo=timezone.utc)

    appts_res = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.creator_id == creator_id,
                Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
                Appointment.start_time_utc < end_of_day,
                Appointment.end_time_utc > start_of_day,
            )
        )
    )
    existing_appts = appts_res.scalars().all()

    slots: List[SlotResponse] = []
    slot_duration = timedelta(minutes=creator.slot_duration_minutes)

    for rule in rules:
        try:
            start_h, start_m = map(int, rule.start_time.split(":"))
            end_h, end_m = map(int, rule.end_time.split(":"))
        except ValueError:
            continue

        rule_start_dt = datetime.combine(target_date, time(start_h, start_m)).replace(tzinfo=timezone.utc)
        rule_end_dt = datetime.combine(target_date, time(end_h, end_m)).replace(tzinfo=timezone.utc)

        current_slot_start = rule_start_dt
        while current_slot_start + slot_duration <= rule_end_dt:
            current_slot_end = current_slot_start + slot_duration

            # Check overlap with existing appointments
            is_occupied = False
            for appt in existing_appts:
                appt_start = _ensure_utc(appt.start_time_utc)
                appt_end = _ensure_utc(appt.end_time_utc)
                # Slot overlaps if (appt_start < slot_end) and (appt_end > slot_start)
                if appt_start < current_slot_end and appt_end > current_slot_start:
                    is_occupied = True
                    break

            if not is_occupied:
                slots.append(
                    SlotResponse(
                        start_time_utc=current_slot_start.isoformat(),
                        end_time_utc=current_slot_end.isoformat(),
                        is_available=True,
                    )
                )

            current_slot_start += slot_duration

    return slots
