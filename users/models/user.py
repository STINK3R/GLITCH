from sqlalchemy import Column, String

from main.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    username = Column(String, index=True)
    hashed_password = Column(String, nullable=False)
