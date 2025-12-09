from fastapi import Depends, HTTPException, status
from users.dependencies.users import user_dependency
from users.models.user import User
from users.enums.user import UserRole


async def admin_dependency(user: User = Depends(user_dependency)):
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this resource"
        )
    return user