from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from admin.schemas.requests import UserUpdateRequest
from users.models.user import User
from users.schemas.requests import RegisterRequest
from users.services.auth import AuthService


class UsersService:

    @staticmethod
    async def get_users(session: AsyncSession) -> List[User]:
        result = await session.execute(
            select(User)
        )
        return result.scalars().all()

    @staticmethod
    async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
        result = await session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(session: AsyncSession, user_id: int) -> Optional[User]:
        result = await session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(session: AsyncSession, new_user: RegisterRequest) -> User:
        hashed_password = AuthService.get_hash(new_user.password)
        father_name = new_user.father_name.capitalize() if new_user.father_name else None
        user = User(
            name=new_user.name.capitalize(),
            surname=new_user.surname.capitalize(),
            father_name=father_name,
            email=new_user.email,
            hashed_password=hashed_password
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def update_user(session: AsyncSession, user_id: int, new_data: UserUpdateRequest) -> User:
        user = await UsersService.get_user_by_id(session, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )
        user.name = new_data.name.capitalize() if new_data.name else user.name
        user.surname = new_data.surname.capitalize() if new_data.surname else user.surname
        user.father_name = new_data.father_name.capitalize() if new_data.father_name else user.father_name
        user.role = new_data.role if new_data.role else user.role
        user.status = new_data.status if new_data.status else user.status
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def user_exists(session: AsyncSession, email: str) -> bool:
        user = await UsersService.get_user_by_email(session, email)
        return user is not None

    @staticmethod
    async def verify_user_password(session: AsyncSession, email: str, password: str) -> tuple[bool, User]:
        user = await UsersService.get_user_by_email(session, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )
        return AuthService.verify_hash(password, user.hashed_password), user

    @staticmethod
    async def reset_password(session: AsyncSession, email: str, new_password: str):
        user = await UsersService.get_user_by_email(session, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )
        if AuthService.verify_hash(new_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password cannot be the same as the old password"
            )
        user.hashed_password = AuthService.get_hash(new_password)
        session.add(user)
        await session.commit()
        return True
