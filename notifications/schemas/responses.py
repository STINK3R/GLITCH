from datetime import datetime

from pydantic import BaseModel, ConfigDict

from notifications.enums.notifications import NotificationType


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    event_id: int
    event_name: str
    type: NotificationType
    is_read: bool
    created_at: datetime
