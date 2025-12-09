from pathlib import Path

from passlib.context import CryptContext
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = 'secret'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RESET_TOKEN_EXPIRE_HOURS: int = 24
    APP_URL: str = 'http://localhost:3000'
    RESET_URL: str = '/reset-password'
    VERIFICATION_URL: str = '/verify-email'
    DATABASE_URL: str = 'postgresql+asyncpg://postgres:postgres@db:5432/postgres'

    SMTP_HOST: str = 'smtp.gmail.com'
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_FROM_EMAIL: str
    SMTP_FROM_NAME: str

    PWD_CONTEXT: CryptContext = CryptContext(schemes=["argon2"], deprecated="auto")

    MEDIA_DIR: Path = Path(__file__).parent.parent / 'media'
    IMAGES_DIR: Path = MEDIA_DIR / 'images'
    AVATARS_DIR: Path = MEDIA_DIR / 'avatars'

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
