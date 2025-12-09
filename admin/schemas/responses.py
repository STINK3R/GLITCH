from pydantic import BaseModel, ConfigDict
from datetime import datetime
from users.enums.user import UserRole, UserStatus

from events.schemas.responses import EventResponse


class UserAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    surname: str
    father_name: str | None
    email: str
    role: UserRole
    status: UserStatus
    created_at: datetime
    updated_at: datetime