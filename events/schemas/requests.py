from datetime import date, datetime, timezone
from typing import Optional

from pydantic import BaseModel, model_validator

from events.enums.events import EventCity, EventStatus, EventType


class EventRequest(BaseModel):
    name: str
    start_date: date
    end_date: date
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

        now = datetime.now(timezone.utc).date()
        if end_date < now:
            raise ValueError("End date must be in the future")
        return self


class EventUpdateRequest(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    short_description: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    pay_data: Optional[str] = None
    max_members: Optional[int] = None
    city: Optional[EventCity] = None
    image_url: Optional[str] = None
    status: Optional[EventStatus] = None
