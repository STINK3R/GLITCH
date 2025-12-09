from sqlalchemy import Column, String, Index

from main.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"
    __table_args__ = (
        Index("idx_user_name_surname", "name", "surname"),
        Index("idx_user_full_name", "name", "surname", "father_name"),
    )

    name = Column(String(128), index=True)
    surname = Column(String(128), index=True)
    father_name = Column(String(128), index=True)
    email = Column(String(128), index=True, unique=True)

    hashed_password = Column(String, nullable=False)
