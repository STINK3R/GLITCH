import logging
from asyncio import gather
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from events.enums.events import EventStatus
from events.services.events import EventsService
from main.config.settings import settings
from main.db.db import SessionLocal
from notifications.enums.notifications import NotificationType
from notifications.services.email import EmailService
from notifications.services.notifications import NotificationsService

scheduler = AsyncIOScheduler()

logger = logging.getLogger(__name__)


@scheduler.scheduled_job('cron', hour=0, minute=0)
async def update_events():
    async with SessionLocal() as session:
        logger.info("Updating events states and sending notifications to users")
        events = await EventsService.get_events(session=session)
        now = datetime.now().date()

        tasks = []

        for event in events:
            if (event.start_date and event.start_date > now and
                    (event.start_date - now).days <= 1 and
                    event.status != EventStatus.COMPLETED and
                    event.status != EventStatus.CANCELLED):
                for member in event.members:
                    tasks.append(EmailService.send_event_reminder_24h_email(
                        email=member.email,
                        event_name=event.name,
                        event_date=event.start_date.strftime("%d.%m.%Y") if event.start_date else "",
                        event_time="",
                        event_location=event.location if event.location else "Не указано",
                        members_count=len(event.members),
                        event_url=f'{settings.APP_URL}{settings.EVENT_DETAIL_URL.format(event_id=event.id)}'
                    ))
                    tasks.append(NotificationsService.create_notification(
                        session=session,
                        user_id=member.id,
                        event_id=event.id,
                        type=NotificationType.EVENT_REMINDER_24H
                    ))

            if event.end_date and event.end_date <= now:
                event.status = EventStatus.COMPLETED
                for member in event.members:
                    tasks.append(EmailService.send_event_review_email(
                        email=member.email,
                        event_name=event.name,
                        event_date=event.start_date.strftime("%d.%m.%Y") if event.start_date else "",
                        event_time="",
                        event_location=event.location if event.location else "Не указано",
                        event_url=f'{settings.APP_URL}{settings.EVENT_DETAIL_URL.format(event_id=event.id)}'
                    ))
                    tasks.append(NotificationsService.create_notification(
                        session=session,
                        user_id=member.id,
                        event_id=event.id,
                        type=NotificationType.EVENT_REVIEW
                    ))
            elif event.start_date and event.end_date and event.start_date <= now < event.end_date:
                event.status = EventStatus.ACTIVE
            elif event.start_date and event.start_date > now:
                if event.status != EventStatus.COMING_SOON:
                    event.status = EventStatus.COMING_SOON

        if tasks:
            await gather(*tasks)

        await session.commit()
