from passlib.context import CryptContext
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = 'secret'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = 'postgresql+asyncpg://postgres:postgres@db:5432/postgres'

    SMTP_HOST: str = 'smtp.gmail.com'
    SMTP_PORT: int = 587
    SMTP_USER: str = 'fodi.moron@gmail.com'
    SMTP_PASSWORD: str = 'edgw jzdp mjvx ieez'
    SMTP_FROM_EMAIL: str = 'fodi.moron@gmail.com'
    SMTP_FROM_NAME: str = 'Glitch'

    PWD_CONTEXT: CryptContext = CryptContext(schemes=["argon2"], deprecated="auto")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
