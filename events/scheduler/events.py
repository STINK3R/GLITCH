import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from events.enums.events import EventStatus
from events.services.events import EventsService
from main.db.db import SessionLocal
from notifications.services.email import EmailService
from main.config.settings import settings
scheduler = AsyncIOScheduler()

logger = logging.getLogger(__name__)

@scheduler.scheduled_job('cron', hour=0, minute=0)
async def update_events():
    async with SessionLocal() as session:
        logger.info("Updating events states and sending notifications to users")
        events = await EventsService.get_events(session=session)
        now = datetime.now()
        
        for event in events:
            if (event.start_date > now and 
                event.start_date - now <= timedelta(hours=24) and 
                event.status != EventStatus.COMPLETED and
                event.status != EventStatus.CANCELLED):
                for member in event.members:
                    await EmailService.send_event_reminder_24h_email(
                        email=member.email, 
                        event_name=event.name, 
                        event_date=event.start_date.strftime("%d.%m.%Y") if event.start_date else "", 
                        event_time=event.start_date.strftime("%H:%M") if event.start_date else "", 
                        event_location=event.location if event.location else "Не указано", 
                        members_count=len(event.members), 
                        event_url=f'{settings.APP_URL}{settings.EVENT_DETAIL_URL.format(event_id=event.id)}'
                    )
            
            if event.end_date <= now:
                event.status = EventStatus.COMPLETED
            elif event.start_date <= now < event.end_date:
                event.status = EventStatus.ACTIVE
            elif event.start_date > now:
                if event.status != EventStatus.COMING_SOON:
                    event.status = EventStatus.COMING_SOON

        await session.commit()
