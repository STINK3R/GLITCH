from passlib.context import CryptContext
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = 'secret'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = 'postgresql+asyncpg://postgres:postgres@db:5432/postgres'

    PWD_CONTEXT: CryptContext = CryptContext(schemes=["argon2"], deprecated="auto")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
