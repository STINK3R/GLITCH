from sqlalchemy import BigInteger, Boolean, Column, Enum, ForeignKey
from sqlalchemy.orm import relationship

from main.models.base import BaseModel
from notifications.enums.notifications import NotificationType


class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    event_id = Column(BigInteger, ForeignKey("events.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    is_read = Column(Boolean, default=False)

    event = relationship("Event", back_populates="notifications_relation")
