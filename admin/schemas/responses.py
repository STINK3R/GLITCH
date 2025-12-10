from datetime import date

from pydantic import BaseModel, ConfigDict

from users.enums.user import UserRole, UserStatus


class UserAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    surname: str
    father_name: str | None
    email: str
    role: UserRole
    status: UserStatus
    created_at: date
    updated_at: date
