from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from events.models.events import Event
from events.schemas.requests import EventRequest

class EventsService:
    @staticmethod
    async def get_events(session: AsyncSession):
        result = await session.execute(
            select(Event)
        )
        return result.scalars().all()
    
    @staticmethod
    def _to_naive_datetime(dt: datetime | None) -> datetime | None:
        if dt is None:
            return None
        if dt.tzinfo is not None:
            return dt.astimezone(timezone.utc).replace(tzinfo=None)
        return dt
    
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
        )
        session.add(event)
        await session.commit()
        await session.refresh(event)
        return event