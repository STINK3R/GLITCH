from pydantic import BaseModel, ConfigDict
from datetime import datetime

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    image_url: str
    start_date: datetime | None
    end_date: datetime
    short_description: str
    description: str
    pay_data: str | None
    max_members: int | None