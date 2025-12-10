from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from main.db.db import SessionDependency
from notifications.services.notifications import NotificationsService
from notifications.schemas.responses import NotificationResponse
from notifications.enums.notifications import NotificationType
from users.models.user import User
from users.dependencies.users import user_dependency
router = APIRouter()

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications_request(
    session: SessionDependency, 
    user: User = Depends(user_dependency)
    ):
    notifications = await NotificationsService.get_notifications(session=session, user_id=user.id)
    notifications_response = [NotificationResponse.model_validate(
                            {
                                "id": notification.id, 
                                "user_id": notification.user_id,
                                "event_id": notification.event_id, 
                                "event_name": notification.event.name, 
                                "type": notification.type, 
                                "is_read": notification.is_read, 
                                "created_at": notification.created_at
                                }
                                ) for notification in notifications]
    return notifications_response

@router.get("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def read_notification_request(
    session: SessionDependency, 
    notification_id: int, 
    user: User = Depends(user_dependency)
    ):
    notification = await NotificationsService.get_notification_by_id(session=session, notification_id=notification_id)
    if notification.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to read this notification"
        )
    if notification.is_read:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notification is already read"
        )
    notification = await NotificationsService.read_notification(session=session, notification_id=notification_id)
    return NotificationResponse.model_validate({"id": notification.id, 
                                                "user_id": notification.user_id, 
                                                "event_id": notification.event_id, 
                                                "event_name": notification.event.name, 
                                                "type": notification.type, 
                                                "is_read": notification.is_read, 
                                                "created_at": notification.created_at})