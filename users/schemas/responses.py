from pydantic import BaseModel
from users.enums.user import UserRole


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    type: str = "Bearer"

class AuthResponse(TokenResponse):
    user_role: UserRole

class MessageResponse(BaseModel):
    message: str
