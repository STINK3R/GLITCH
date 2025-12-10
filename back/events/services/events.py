import csv
from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import HTTPException, status
from openpyxl import Workbook
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from events.enums.events import EventCity, EventStatus, EventType
from events.models.events import Event, EventComments, EventInvitedUsers, EventMembers
from events.schemas.requests import EventCommentRequest, EventRequest, EventUpdateRequest
from main.config.settings import settings
from users.models.user import User


class EventsService:
    @staticmethod
    async def get_events(
        session: AsyncSession,
        user_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        max_members: Optional[int] = None,
        name: Optional[str] = None,
        type: Optional[List[EventType]] = None,
        status: Optional[EventStatus] = None,
        city: Optional[List[EventCity]] = None,
        is_admin: bool = False,
        current_user_id: Optional[int] = None,
    ):
        query = select(Event).options(selectinload(Event.members), selectinload(Event.likes), selectinload(Event.invited_users))

        # Если указан user_id, фильтруем по участникам
        if user_id is not None:
            query = query.join(EventMembers).where(EventMembers.user_id == user_id)

        conditions = []
        if status != EventStatus.COMPLETED:
            conditions.append(Event.status != EventStatus.COMPLETED)
        if not is_admin:
            conditions.append(Event.status != EventStatus.CANCELLED)
        if start_date is not None:
            conditions.append(Event.start_date >= start_date)
        if end_date is not None:
            conditions.append(Event.end_date <= end_date)
        if max_members is not None:
            conditions.append(Event.max_members == max_members)

        # TODO: search by name in Event.name
        if name is not None:
            conditions.append(Event.name == name)
        if type is not None:
            if len(type) > 0:
                conditions.append(Event.type.in_(type))
        if status is not None:
            conditions.append(Event.status == status)
        if city is not None:
            if len(city) > 0:
                conditions.append(Event.city.in_(city))

        if not is_admin and current_user_id is not None:
            query = query.join(EventInvitedUsers).where(EventInvitedUsers.user_id == current_user_id)

        if conditions:
            query = query.where(*conditions)

        if user_id is not None or (not is_admin and current_user_id is not None):
            query = query.distinct()

        result = await session.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_event_by_id(session: AsyncSession, event_id: int):
        result = await session.execute(
            select(Event)
            .options(selectinload(Event.members), selectinload(Event.likes), selectinload(Event.invited_users))
            .where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        return event

    @staticmethod
    async def create_event(session: AsyncSession, event: EventRequest, image_path: str, status: EventStatus = EventStatus.COMING_SOON):
        if event.invited_users:
            from users.services.users import UsersService
            invalid_user_ids = []
            for user_id in event.invited_users:
                try:
                    await UsersService.get_user_by_id(session, user_id)
                except HTTPException:
                    invalid_user_ids.append(user_id)
            
            if invalid_user_ids:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Users with IDs {invalid_user_ids} not found"
                )
        
        start_date = event.start_date

        now = datetime.now(timezone.utc).date()
        if start_date <= now:
            status = EventStatus.ACTIVE
        else:
            status = EventStatus.COMING_SOON

        event_obj = Event(
            name=event.name,
            image_url=image_path,
            start_date=event.start_date,
            end_date=event.end_date,
            short_description=event.short_description,
            description=event.description,
            pay_data=event.pay_data,
            max_members=event.max_members,
            location=event.location,
            city=event.city,
            type=event.type,
            status=status,
        )

        session.add(event_obj)
        await session.commit()
        await session.refresh(event_obj)

        if event.invited_users:
            for user_id in event.invited_users:
                invited_user = EventInvitedUsers(
                    event_id=event_obj.id,
                    user_id=user_id
                )
                session.add(invited_user)
            await session.commit()

        result = await session.execute(
            select(Event)
            .options(selectinload(Event.members), selectinload(Event.likes), selectinload(Event.invited_users))
            .where(Event.id == event_obj.id)
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
        invited_user_ids = [invited_user.id for invited_user in event.invited_users]
        if user.id not in invited_user_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User was not invited to this event"
            )

        user_ids = [member.id for member in event.members]
        if user.id in user_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already joined the event"
            )

        if event.max_members is not None and len(event.members) >= event.max_members:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event is full"
            )

        if event.status == EventStatus.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event is cancelled"
            )

        if event.status == EventStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event is completed"
            )

        event.members.append(user)
        await session.commit()

        result = await session.execute(
            select(Event)
            .options(selectinload(Event.members), selectinload(Event.likes), selectinload(Event.invited_users))
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
            .options(selectinload(Event.members), selectinload(Event.likes), selectinload(Event.invited_users))
            .where(Event.id == event.id)
        )
        return result.scalar_one()

    @staticmethod
    async def delete_event(session: AsyncSession, event_id: int) -> bool:
        event = await EventsService.get_event_by_id(session, event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        members = event.members
        for member in members:
            await EventsService.leave_event(session, event_id, member)
        await session.delete(event)
        await session.commit()
        return True

    @staticmethod
    async def update_event(session: AsyncSession, event: Event, event_request: EventUpdateRequest) -> Event:

        event.name = event_request.name if event_request.name else event.name
        event.start_date = event_request.start_date if event_request.start_date else event.start_date
        event.end_date = event_request.end_date if event_request.end_date else event.end_date
        event.short_description = event_request.short_description if event_request.short_description else event.short_description
        event.description = event_request.description if event_request.description else event.description
        event.pay_data = event_request.pay_data if event_request.pay_data else event.pay_data
        event.max_members = event_request.max_members if event_request.max_members else event.max_members
        event.city = event_request.city if event_request.city else event.city
        event.location = event_request.location if event_request.location else event.location
        event.status = event_request.status if event_request.status else event.status
        await session.commit()
        await session.refresh(event)
        return event

    @staticmethod
    async def get_event_members(session: AsyncSession, event_id: int) -> List[User]:
        event = await EventsService.get_event_by_id(session, event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        return event.members

    @staticmethod
    async def export_event_members_to_csv(session: AsyncSession, event_id: int) -> str:
        members = await EventsService.get_event_members(session, event_id)
        if not settings.CSV_DIR.exists():
            settings.CSV_DIR.mkdir(parents=True, exist_ok=True)
        csv_path = settings.CSV_DIR / f"members_event_{event_id}.csv"
        with open(csv_path, "w") as f:
            writer = csv.writer(f)
            writer.writerow(["ID", "Имя", "Фамилия", "Отчество", "Email"])
            for member in members:
                writer.writerow([member.id, member.name, member.surname, member.father_name if member.father_name else "", member.email])
        return str(csv_path)

    @staticmethod
    async def export_event_members_to_excel(session: AsyncSession, event_id: int) -> str:
        members = await EventsService.get_event_members(session, event_id)
        if not settings.EXCEL_DIR.exists():
            settings.EXCEL_DIR.mkdir(parents=True, exist_ok=True)
        excel_path = settings.EXCEL_DIR / f"members_event_{event_id}.xlsx"
        wb = Workbook()
        ws = wb.active
        ws.append(["ID", "Имя", "Фамилия", "Отчество", "Email"])
        for member in members:
            ws.append([member.id, member.name, member.surname, member.father_name if member.father_name else "", member.email])
        wb.save(excel_path)
        return str(excel_path)

    @staticmethod
    async def like_event(session: AsyncSession, event_id: int, user: User):
        event = await EventsService.get_event_by_id(session, event_id)
        user_ids = [like.id for like in event.likes]
        if user.id in user_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already liked the event"
            )
        event.likes.append(user)
        await session.commit()
        result = await session.execute(
            select(Event)
            .options(selectinload(Event.members), selectinload(Event.likes), selectinload(Event.invited_users))
            .where(Event.id == event.id)
        )
        return result.scalar_one()

    @staticmethod
    async def unlike_event(session: AsyncSession, event_id: int, user: User):
        event = await EventsService.get_event_by_id(session, event_id)

        user_ids = [like.id for like in event.likes]
        if user.id not in user_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not liked the event"
            )
        event.likes.remove(user)
        await session.commit()
        result = await session.execute(
            select(Event)
            .options(selectinload(Event.members), selectinload(Event.likes), selectinload(Event.invited_users))
            .where(Event.id == event.id)
        )
        return result.scalar_one()

    @staticmethod
    async def get_liked_events(session: AsyncSession, user: User, is_admin: bool = False) -> List[Event]:
        query = select(Event).options(selectinload(Event.likes), selectinload(Event.members), selectinload(Event.invited_users))
        query = query.where(Event.likes.contains(user))
        
        if not is_admin:
            query = query.join(EventInvitedUsers).where(EventInvitedUsers.user_id == user.id).distinct()
        
        result = await session.execute(query)
        return result.scalars().all()

    @staticmethod
    async def comment_event(session: AsyncSession, event_id: int, user: User, comment: EventCommentRequest):
        event = await EventsService.get_event_by_id(session, event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )

        if user.id not in [member.id for member in event.members]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not a member of the event"
            )
        if event.status != EventStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event not completed"
            )
        
        existing_comment_result = await session.execute(
            select(EventComments)
            .where(EventComments.event_id == event_id)
            .where(EventComments.user_id == user.id)
        )
        existing_comment = existing_comment_result.scalar_one_or_none()
        
        if existing_comment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already commented the event"
            )
        
        comment_obj = EventComments(
            event_id=event_id,
            user_id=user.id,
            comment=comment.comment,
            rating=comment.rating,
        )
        session.add(comment_obj)
        await session.commit()
        result = await session.execute(
            select(Event)
            .options(selectinload(Event.members), selectinload(Event.likes), selectinload(Event.comments), selectinload(Event.invited_users))
            .where(Event.id == event_id)
        )
        return result.scalar_one()
    
    @staticmethod
    async def get_event_with_comments_and_members(session: AsyncSession, event_id: int) -> Event:
        result = await session.execute(
            select(Event)
            .options(selectinload(Event.comments), selectinload(Event.members))
            .where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        return event