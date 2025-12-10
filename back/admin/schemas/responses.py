from datetime import datetime

from pydantic import BaseModel, ConfigDict

from users.enums.user import UserRole, UserStatus
from users.schemas.responses import UserResponse


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


class EventCommentAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: int
    user_id: int
    user: UserResponse
    comment: str
    rating: int | None