from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from events.enums.events import EventCity, EventStatus
from events.models.events import Event, EventMembers
from events.schemas.requests import EventRequest
from users.models.user import User


class EventsService:
    @staticmethod
    async def get_events(
        session: AsyncSession,
        user_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        max_members: Optional[int] = None,
        name: Optional[str] = None,
        status: Optional[EventStatus] = None,
        city: Optional[EventCity] = None,
    ):
        query = select(Event).options(selectinload(Event.members))

        if user_id is not None:
            query = query.join(EventMembers).where(EventMembers.user_id == user_id)

        conditions = []

        if start_date is not None:
            conditions.append(Event.start_date >= start_date)
        if end_date is not None:
            conditions.append(Event.end_date <= end_date)
        if max_members is not None:
            conditions.append(Event.max_members == max_members)
        if name is not None:
            conditions.append(Event.name == name)
        if status is not None:
            conditions.append(Event.status == status)
        if city is not None:
            conditions.append(Event.city == city)

        if conditions:
            query = query.where(*conditions)

        if user_id is not None:
            query = query.distinct()

        result = await session.execute(query)
        return result.scalars().all()

    @staticmethod
    def _to_naive_datetime(dt: datetime | None) -> datetime | None:
        if dt is None:
            return None
        if dt.tzinfo is not None:
            return dt.astimezone(timezone.utc).replace(tzinfo=None)
        return dt

    @staticmethod
    async def get_event_by_id(session: AsyncSession, event_id: int):
        result = await session.execute(
            select(Event)
            .options(selectinload(Event.members))
            .where(Event.id == event_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_event(session: AsyncSession, event: EventRequest, image_path: str):
        event = Event(
            name=event.name,
            image_url=image_path,
            start_date=EventsService._to_naive_datetime(event.start_date),
            end_date=EventsService._to_naive_datetime(event.end_date),
            short_description=event.short_description,
            description=event.description,
            pay_data=event.pay_data,
            max_members=event.max_members,
            city=event.city,
        )
        session.add(event)
        await session.commit()
        await session.refresh(event)

        result = await session.execute(
            select(Event)
            .options(selectinload(Event.members))
            .where(Event.id == event.id)
        )
        return result.scalar_one()

    @staticmethod
    async def join_event(session: AsyncSession, event_id: int, user: User):
        event = await EventsService.get_event_by_id(session, event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )

        user_ids = [member.id for member in event.members]
        if user.id in user_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already joined the event"
            )

        event.members.append(user)
        await session.commit()

        result = await session.execute(
            select(Event)
            .options(selectinload(Event.members))
            .where(Event.id == event.id)
        )
        return result.scalar_one()

    @staticmethod
    async def leave_event(session: AsyncSession, event_id: int, user: User):
        event = await EventsService.get_event_by_id(session, event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )

        user_ids = [member.id for member in event.members]
        if user.id not in user_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not joined the event"
            )

        event.members.remove(user)
        await session.commit()

        result = await session.execute(
            select(Event)
            .options(selectinload(Event.members))
            .where(Event.id == event.id)
        )
        return result.scalar_one()
