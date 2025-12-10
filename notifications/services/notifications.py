from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from fastapi import HTTPException, status
from notifications.models.notifications import Notification
from notifications.enums.notifications import NotificationType

class NotificationsService:
    @staticmethod
    async def create_notification(session: AsyncSession, user_id: int, event_id: int, type: NotificationType) -> Notification:
        notification = Notification(
            user_id=user_id,
            event_id=event_id,
            type=type,
        )
        session.add(notification)
        await session.flush()
        return notification

    @staticmethod
    async def get_notifications(session: AsyncSession, user_id: int, is_read: bool = False) -> List[Notification]:
        result = await session.execute(
            select(Notification).where(Notification.user_id == user_id, 
                                       Notification.is_read == is_read)
                                       .order_by(Notification.created_at.desc())
                                       .options(joinedload(Notification.event))
                                       )
        return result.scalars().all()
    
    @staticmethod
    async def get_notification_by_id(session: AsyncSession, notification_id: int) -> Notification:
        result = await session.execute(
            select(Notification)
            .where(Notification.id == notification_id)
            .options(joinedload(Notification.event))
        )
        notification = result.scalar_one_or_none()
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        return notification
    
    @staticmethod
    async def read_notification(session: AsyncSession, notification_id: int) -> Notification:
        notification = await NotificationsService.get_notification_by_id(session=session, notification_id=notification_id)
        notification.is_read = True
        await session.commit()
        return notification