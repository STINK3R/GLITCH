from pydantic import BaseModel, ConfigDict
from datetime import datetime
from notifications.enums.notifications import NotificationType
from events.schemas.responses import EventResponse
class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    event_id: int
    event_name: str
    type: NotificationType
    is_read: bool
    created_at: datetime