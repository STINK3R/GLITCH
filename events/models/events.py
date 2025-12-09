from sqlalchemy import Column, DateTime, Enum, String, ForeignKey, Index, Integer
from sqlalchemy.orm import relationship
from main.models.base import BaseModel
from events.enums.events import EventStatus

class EventMembers(BaseModel):
    __tablename__ = "event_members"
    __table_args__ = (
        Index("idx_event_members_event_id", "event_id"),
        Index("idx_event_members_user_id", "user_id"),
    )

    event_id = Column(Integer, ForeignKey("events.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)


class Event(BaseModel):
    __tablename__ = "events"
    __table_args__ = (
        Index("idx_event_name", "name"),
        Index("idx_event_image_url", "image_url"),
        Index("idx_event_start_date", "start_date"),
        Index("idx_event_end_date", "end_date"),
        Index("idx_event_status", "status"),
    )

    name = Column(String(128), nullable=False, index=True)
    image_url = Column(String(1024), nullable=False, index=True)

    start_date = Column(DateTime, nullable=True, index=True)
    end_date = Column(DateTime, nullable=False, index=True)

    short_description = Column(String(128), nullable=False, index=True)
    description = Column(String(1024), nullable=False, index=True)

    pay_data = Column(String(2048), nullable=True)

    max_members = Column(Integer, nullable=True)
    
    members = relationship("User", secondary=EventMembers.__table__, back_populates="events")
    status = Column(Enum(EventStatus), index=True, default=EventStatus.ACTIVE)