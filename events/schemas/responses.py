from datetime import datetime

from pydantic import BaseModel, ConfigDict

from events.enums.events import EventStatus
from users.schemas.responses import UserResponse


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    image_url: str
    start_date: datetime | None
    end_date: datetime
    short_description: str | None
    description: str
    location: str | None
    pay_data: str | None
    max_members: int | None
    status: EventStatus
    members: list[UserResponse]
    is_user_in_event: bool = False
