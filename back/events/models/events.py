from sqlalchemy import Column, Date, Enum, ForeignKey, Index, Integer, String
from sqlalchemy.orm import relationship

from events.enums.events import EventCity, EventStatus, EventType
from main.models.base import Base, BaseModel


class EventMembers(Base):
    __tablename__ = "event_members"
    __table_args__ = (
        Index("idx_event_members_event_id", "event_id"),
        Index("idx_event_members_user_id", "user_id"),
    )

    event_id = Column(Integer, ForeignKey("events.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)


class EventInvitedUsers(Base):
    __tablename__ = "event_invited_users"
    __table_args__ = (
        Index("idx_event_invited_users_event_id", "event_id"),
        Index("idx_event_invited_users_user_id", "user_id"),
    )

    event_id = Column(Integer, ForeignKey("events.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)


class EventLikes(Base):
    __tablename__ = "event_likes"
    __table_args__ = (
        Index("idx_event_likes_event_id", "event_id"),
        Index("idx_event_likes_user_id", "user_id"),
    )

    event_id = Column(Integer, ForeignKey("events.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)

class EventComments(Base):
    __tablename__ = "event_comments"
    __table_args__ = (
        Index("idx_event_comments_event_id", "event_id"),
        Index("idx_event_comments_user_id", "user_id"),
    )

    event_id = Column(Integer, ForeignKey("events.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    comment = Column(String(1024), nullable=False)
    rating = Column(Integer, nullable=True)

    event = relationship("Event", back_populates="comments")
    user = relationship("User", back_populates="comments")

class Event(BaseModel):
    __tablename__ = "events"
    __table_args__ = (
        Index("idx_event_name", "name"),
        Index("idx_event_image_url", "image_url"),
        Index("idx_event_start_date", "start_date"),
        Index("idx_event_end_date", "end_date"),
        Index("idx_event_status", "status"),
        Index("idx_event_city", "city"),
    )

    name = Column(String(128), nullable=False, index=True)
    image_url = Column(String(1024), nullable=False, index=True)

    start_date = Column(Date, nullable=True, index=True)
    end_date = Column(Date, nullable=False, index=True)

    short_description = Column(String(128), nullable=True, index=True)
    description = Column(String(1024), nullable=False, index=True)

    pay_data = Column(String(2048), nullable=True)

    max_members = Column(Integer, nullable=True)

    city = Column(Enum(EventCity), nullable=True, index=True)
    location = Column(String(512), nullable=True)
    type = Column(Enum(EventType), nullable=False, index=True, default=EventType.OTHER)

    members = relationship("User", secondary=EventMembers.__table__, back_populates="events")
    status = Column(Enum(EventStatus), index=True, default=EventStatus.COMING_SOON)

    likes = relationship("User", secondary=EventLikes.__table__, back_populates="liked_events")
    comments = relationship("EventComments", back_populates="event")
    notifications_relation = relationship("Notification", back_populates="event")
    invited_users = relationship("User", secondary=EventInvitedUsers.__table__, back_populates="invited_events")
