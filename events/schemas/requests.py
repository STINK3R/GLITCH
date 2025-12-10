from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, model_validator

from events.enums.events import EventCity, EventType, EventStatus


class EventRequest(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    short_description: Optional[str] = None
    location: Optional[str] = None
    description: str
    pay_data: Optional[str] = None
    max_members: Optional[int] = None
    city: Optional[EventCity] = None
    type: EventType

    @model_validator(mode='after')
    def validate_dates(self) -> 'EventRequest':
        if self.start_date >= self.end_date:
            raise ValueError("Start date must be before end date")
        end_date = self.end_date
        if end_date.tzinfo is None:
            end_date = end_date.replace(tzinfo=timezone.utc)
        elif end_date.tzinfo != timezone.utc:
            end_date = end_date.astimezone(timezone.utc)
        
        now = datetime.now(timezone.utc)
        if end_date < now:
            raise ValueError("End date must be in the future")
        return self


class EventUpdateRequest(BaseModel):
    name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    short_description: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    pay_data: Optional[str] = None
    max_members: Optional[int] = None
    city: Optional[EventCity] = None
    image_url: Optional[str] = None
    status: Optional[EventStatus] = None