from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
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
    father_name: str = Field(
                        min_length=2,
                        max_length=128,
                        pattern=r'^[А-Яа-яЁё\s-]+$',
                        description="Father name must contain only Russian letters",
                        example="Иванович"
                        )
    email: EmailStr
    password: str
    repeat_password: str


class RegisterConfirmRequest(BaseModel):
    email: EmailStr
    code: str


class AuthRequest(BaseModel):
    email: EmailStr
    password: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordApplyRequest(BaseModel):
    reset_token: str
    password: str
