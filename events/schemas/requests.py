from pydantic import BaseModel, Field, model_validator
from datetime import datetime

class EventRequest(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    short_description: str
    description: str
    pay_data: str
    max_members: int

    @model_validator(mode='after')
    def validate_dates(self) -> 'EventRequest':
        if self.start_date >= self.end_date:
            raise ValueError("Start date must be before end date")
        return self