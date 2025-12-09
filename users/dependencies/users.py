from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from users.services.auth import AuthService
from users.services.users import UsersService
from main.db.db import SessionDependency
from users.enums.user import UserRole
from users.models.user import User


security = HTTPBearer()

async def user_dependency(session: SessionDependency, security: HTTPAuthorizationCredentials = Depends(security)):

        payload = AuthService.verify_token(token=security.credentials, token_type="access")
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        user_id = payload.get("id")
        if user_id is None or not isinstance(user_id, int):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        user = await UsersService.get_user_by_id(session, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )
        return user
        

async def admin_dependency(session: SessionDependency, user: User = Depends(user_dependency)):
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this resource"
        )
    return user