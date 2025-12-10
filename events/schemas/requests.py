from datetime import date, datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, Field, model_validator

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
    invited_users: List[int] = Field(..., min_length=1, description="List of user IDs to invite to the event")

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


class EventCommentRequest(BaseModel):
    comment: str
    rating: float

    @model_validator(mode='after')
    def validate_rating(self) -> 'EventCommentRequest':
        if self.rating is not None and (self.rating < 1 or self.rating > 5):
            raise ValueError("Rating must be between 1 and 5")
        return self