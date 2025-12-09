from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    name: str = Field(pattern=r'^[А-Яа-яЁё\s-]+$', description="Name must contain only Russian letters")
    surname: str = Field(pattern=r'^[А-Яа-яЁё\s-]+$', description="Surname must contain only Russian letters")
    father_name: str = Field(pattern=r'^[А-Яа-яЁё\s-]+$', description="Father name must contain only Russian letters")
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