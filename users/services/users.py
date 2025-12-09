from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from users.models.user import User
from users.services.auth import AuthService


class UsersService:

    @staticmethod
    async def get_user_by_username(session: AsyncSession, username: str) -> Optional[User]:
        result = await session.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(session: AsyncSession, username: str, password: str) -> User:
        hashed_password = AuthService.get_password_hash(password)
        user = User(username=username, hashed_password=hashed_password)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def user_exists(session: AsyncSession, username: str) -> bool:
        user = await UsersService.get_user_by_username(session, username)
        return user is not None

    @staticmethod
    async def verify_user_password(session: AsyncSession, username: str, password: str) -> bool:
        user = await UsersService.get_user_by_username(session, username)
        if not user:
            return False, 0
        return AuthService.verify_password(password, user.hashed_password), user.id
