from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.notification import InAppNotification
from app.models.user import User
from app.schemas.notification import NotificationListResponse, NotificationResponse

router = APIRouter()


@router.get("", response_model=NotificationListResponse)
async def get_user_notifications(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get notifications for the currently logged-in user, along with unread count.
    """
    # Fetch notifications ordered by newest first
    stmt = (
        select(InAppNotification)
        .where(InAppNotification.user_id == current_user.id)
        .order_by(desc(InAppNotification.created_at))
        .limit(limit)
    )
    result = await db.execute(stmt)
    notifications = result.scalars().all()

    # Count unread notifications
    count_stmt = (
        select(func.count(InAppNotification.id))
        .where(
            InAppNotification.user_id == current_user.id,
            InAppNotification.is_read == False,
        )
    )
    count_result = await db.execute(count_stmt)
    unread_count = count_result.scalar() or 0

    return NotificationListResponse(
        unread_count=unread_count,
        notifications=notifications,
    )


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a single notification as read.
    """
    stmt = select(InAppNotification).where(
        InAppNotification.id == notification_id,
        InAppNotification.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    notification = result.scalar_one_or_none()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return notification


@router.post("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark all unread notifications for the current user as read.
    """
    stmt = (
        update(InAppNotification)
        .where(
            InAppNotification.user_id == current_user.id,
            InAppNotification.is_read == False,
        )
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.commit()
    return {"message": "All notifications marked as read"}
