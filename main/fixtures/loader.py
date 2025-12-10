import logging
import os

from sqlalchemy.ext.asyncio import AsyncSession

from main.db.db import SessionLocal
from main.fixtures.events import create_events_fixtures
from main.fixtures.users import create_users_fixtures

logger = logging.getLogger(__name__)


async def load_fixtures():
    """Загружает все фикстуры в базу данных"""
    
    # Проверяем, нужно ли загружать фикстуры
    # Можно использовать переменную окружения для управления
    load_fixtures_env = os.getenv("LOAD_FIXTURES", "true").lower()
    if load_fixtures_env not in ("true", "1", "yes"):
        logger.info("Пропуск загрузки фикстур (LOAD_FIXTURES=false)")
        return
    
    logger.info("Начало загрузки фикстур...")
    
    async with SessionLocal() as session:
        try:
            # Создаем пользователей
            logger.info("Создание пользователей...")
            users = await create_users_fixtures(session)
            logger.info(f"Создано/найдено {len(users)} пользователей")
            
            # Создаем события
            logger.info("Создание событий...")
            events = await create_events_fixtures(session, users)
            logger.info(f"Создано/найдено {len(events)} событий")
            
            await session.commit()
            logger.info("Фикстуры успешно загружены!")
            
        except Exception as e:
            logger.error(f"Ошибка при загрузке фикстур: {e}", exc_info=True)
            await session.rollback()
            raise

