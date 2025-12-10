from typing import Optional

from pydantic import BaseModel, Field

from users.enums.user import UserRole, UserStatus


class UserUpdateRequest(BaseModel):
    id: int
    name: str = Field(
        min_length=2,
        max_length=128,
        pattern=r'^[А-Яа-яЁё\s-]+$',
        description="Name must contain only Russian letters",
        example="Иван"
    )
    surname: str = Field(
        min_length=2,
        max_length=128,
        pattern=r'^[А-Яа-яЁё\s-]+$',
        description="Surname must contain only Russian letters",
        example="Иванов"
    )
    father_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=128,
        pattern=r'^[А-Яа-яЁё\s-]+$',
        description="Father name must contain only Russian letters",
        example="Иванович"
    )

    role: UserRole
    status: UserStatus


class ResetUserPasswordRequest(BaseModel):
    new_password: str
