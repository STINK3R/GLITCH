from sqlalchemy import Column, Enum, Index, String
from sqlalchemy.orm import relationship

from main.models.base import BaseModel
from users.enums.user import UserRole, UserStatus


class User(BaseModel):
    __tablename__ = "users"
    __table_args__ = (
        Index("idx_user_name_surname", "name", "surname"),
        Index("idx_user_full_name", "name", "surname", "father_name"),
    )

    name = Column(String(128), index=True)
    surname = Column(String(128), index=True)
    father_name = Column(String(128), index=True, nullable=True)
    email = Column(String(128), index=True, unique=True)
    role = Column(Enum(UserRole), index=True, default=UserRole.USER)
    status = Column(Enum(UserStatus), index=True, default=UserStatus.ACTIVE)

    hashed_password = Column(String, nullable=False)

    events = relationship("Event", secondary="event_members", back_populates="members")
