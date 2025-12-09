from typing import Optional

from pydantic import BaseModel, ConfigDict

from users.enums.user import UserRole


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    surname: str
    father_name: str | None
    email: str
    role: UserRole


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    type: str = "Bearer"
    user: Optional[UserResponse] = None
