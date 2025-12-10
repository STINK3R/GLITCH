from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from users.enums.user import UserRole, UserStatus
from users.models.user import User
from users.services.auth import AuthService


async def create_users_fixtures(session: AsyncSession) -> list[User]:
    """Создает тестовых пользователей для разработки"""
    
    users_data = [
        {
            "name": "Админ",
            "surname": "Админов",
            "father_name": "Админович",
            "email": "admin@example.com",
            "password": "admin123",
            "role": UserRole.ADMIN,
            "status": UserStatus.ACTIVE,
        },
        {
            "name": "Иван",
            "surname": "Иванов",
            "father_name": "Иванович",
            "email": "ivan@example.com",
            "password": "user123",
            "role": UserRole.USER,
            "status": UserStatus.ACTIVE,
        },
        {
            "name": "Мария",
            "surname": "Петрова",
            "father_name": "Сергеевна",
            "email": "maria@example.com",
            "password": "user123",
            "role": UserRole.USER,
            "status": UserStatus.ACTIVE,
        },
        {
            "name": "Алексей",
            "surname": "Сидоров",
            "father_name": "Александрович",
            "email": "alex@example.com",
            "password": "user123",
            "role": UserRole.USER,
            "status": UserStatus.ACTIVE,
        },
        {
            "name": "Елена",
            "surname": "Козлова",
            "father_name": "Дмитриевна",
            "email": "elena@example.com",
            "password": "user123",
            "role": UserRole.USER,
            "status": UserStatus.ACTIVE,
        },
        {
            "name": "Дмитрий",
            "surname": "Смирнов",
            "father_name": "Владимирович",
            "email": "dmitry@example.com",
            "password": "user123",
            "role": UserRole.USER,
            "status": UserStatus.ACTIVE,
        },
        {
            "name": "Анна",
            "surname": "Волкова",
            "father_name": "Игоревна",
            "email": "anna@example.com",
            "password": "user123",
            "role": UserRole.USER,
            "status": UserStatus.ACTIVE,
        },
        {
            "name": "Сергей",
            "surname": "Новиков",
            "father_name": "Петрович",
            "email": "sergey@example.com",
            "password": "user123",
            "role": UserRole.USER,
            "status": UserStatus.ACTIVE,
        },
        {
            "name": "Ольга",
            "surname": "Морозова",
            "father_name": "Андреевна",
            "email": "olga@example.com",
            "password": "user123",
            "role": UserRole.USER,
            "status": UserStatus.ACTIVE,
        },
        {
            "name": "Павел",
            "surname": "Лебедев",
            "father_name": "Николаевич",
            "email": "pavel@example.com",
            "password": "user123",
            "role": UserRole.USER,
            "status": UserStatus.ACTIVE,
        },
    ]
    
    users = []
    for user_data in users_data:
        # Проверяем, существует ли пользователь
        result = await session.execute(
            select(User).where(User.email == user_data["email"])
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            users.append(existing_user)
            continue
        
        # Создаем нового пользователя
        hashed_password = AuthService.get_hash(user_data["password"])
        user = User(
            name=user_data["name"],
            surname=user_data["surname"],
            father_name=user_data["father_name"],
            email=user_data["email"],
            hashed_password=hashed_password,
            role=user_data["role"],
            status=user_data["status"],
        )
        session.add(user)
        users.append(user)
    
    await session.commit()
    
    # Обновляем created_at для всех пользователей
    for user in users:
        await session.refresh(user)
    
    return users

