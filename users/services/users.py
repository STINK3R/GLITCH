from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from users.models.user import User
from users.services.auth import AuthService
from users.schemas.requests import RegisterRequest

class UsersService:

    @staticmethod
    async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
        result = await session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(session: AsyncSession, new_user: RegisterRequest) -> User:
        hashed_password = AuthService.get_password_hash(new_user.password)
        user = User(
            name=new_user.name.capitalize(), 
            surname=new_user.surname.capitalize(), 
            father_name=new_user.father_name.capitalize(), 
            email=new_user.email, 
            hashed_password=hashed_password
            )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def user_exists(session: AsyncSession, email: str) -> bool:
        user = await UsersService.get_user_by_email(session, email)
        return user is not None

    @staticmethod
    async def verify_user_password(session: AsyncSession, email: str, password: str) -> bool:
        user = await UsersService.get_user_by_email(session, email)
        if not user:
            return False, 0
        return AuthService.verify_password(password, user.hashed_password), user.id

    @staticmethod
    async def reset_password(session: AsyncSession, email: str, new_password: str):
        user = await UsersService.get_user_by_email(session, email)
        if not user:
            return False
        user.hashed_password = AuthService.get_password_hash(new_password)
        session.add(user)
        await session.commit()
        return True