from datetime import datetime
from typing import Optional

from pydantic import BaseModel, model_validator

from events.enums.events import EventCity


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

    @model_validator(mode='after')
    def validate_dates(self) -> 'EventRequest':
        if self.start_date >= self.end_date:
            raise ValueError("Start date must be before end date")
        return self
