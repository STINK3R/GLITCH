from asyncio import create_task
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status

from events.enums.events import EventCity, EventStatus, EventType
from events.schemas.requests import EventCommentRequest
from events.schemas.responses import EventResponse
from events.services.events import EventsService
from main.config.settings import settings
from main.db.db import SessionDependency
from notifications.services.email import EmailService
from users.dependencies.users import user_dependency
from users.enums.user import UserRole
from users.models.user import User
from users.services.users import UsersService
from admin.dependencies.admin import admin_dependency
from admin.schemas.responses import EventCommentAdminResponse
router = APIRouter()


@router.get("/events", response_model=list[EventResponse], status_code=status.HTTP_200_OK)
async def get_events_request(
    session: SessionDependency,
    user: User = Depends(user_dependency),
    user_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    max_members: Optional[int] = None,
    name: Optional[str] = None,
    type: Optional[List[EventType]] = Query(None, description="List of event types (can specify multiple)"),
    status: Optional[EventStatus] = None,
    city: Optional[List[EventCity]] = Query(None, description="List of cities (can specify multiple)"),
) -> list[EventResponse]:

    if user_id == -1:
        user_id = user.id


    events = await EventsService.get_events(
        session=session,
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        max_members=max_members,
        name=name,
        type=type,
        status=status,
        city=city,
        is_admin=user.role == UserRole.ADMIN,
        current_user_id=user.id,
    )

    result = []
    for event in events:
        is_user_in_event = user.id in [
            member.id for member in event.members
        ]
        is_user_liked_event = user.id in [like.id for like in event.likes]
        event_response = EventResponse.model_validate(event)
        result.append(event_response.model_copy(update={
            'is_user_in_event': is_user_in_event,
            'is_user_liked_event': is_user_liked_event
        }))
    return result


@router.get('/events/liked')
async def get_likes_request(
    session: SessionDependency,
    user: User = Depends(user_dependency),
) -> list[EventResponse]:
    events = await EventsService.get_liked_events(session, user=user, is_admin=user.role == UserRole.ADMIN)
    result = []
    for event in events:
        is_user_in_event = user.id in [member.id for member in event.members]
        is_user_liked_event = user.id in [like.id for like in event.likes]
        event_response = EventResponse.model_validate(event)
        result.append(event_response.model_copy(update={
            'is_user_liked_event': is_user_liked_event,
            'is_user_in_event': is_user_in_event
        }))
    return result


@router.get('/events/{event_id}', response_model=EventResponse, status_code=status.HTTP_200_OK)
async def get_event_request(
    session: SessionDependency,
    event_id: int,
    user: User = Depends(user_dependency),
) -> EventResponse:
    event = await EventsService.get_event_by_id(session, event_id)
    if user.role != UserRole.ADMIN:
        invited_user_ids = [invited_user.id for invited_user in event.invited_users]
        if user.id not in invited_user_ids:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not invited to this event"
            )
    
    event_response = EventResponse.model_validate(event)
    is_user_in_event = user.id in [member.id for member in event.members]
    is_user_liked_event = user.id in [like.id for like in event.likes]
    return event_response.model_copy(update={
        'is_user_in_event': is_user_in_event,
        'is_user_liked_event': is_user_liked_event
    })


@router.post("/events/{event_id}/join", response_model=EventResponse, status_code=status.HTTP_200_OK)
async def join_event_request(
    session: SessionDependency,
    event_id: int,
    user: User = Depends(user_dependency),
) -> EventResponse:
    event_obj = await EventsService.join_event(session, event_id, user=user)
    event_response = EventResponse.model_validate(event_obj)

    event_date = event_obj.start_date.strftime("%d.%m.%Y") if event_obj.start_date else ""
    event_location = event_obj.location if event_obj.location else ""

    admin_emails = await UsersService.get_admin_emails(session)
    for email in admin_emails:
        create_task(EmailService.send_event_member_confirmed_email(
            email=email,
            event_name=event_obj.name,
            event_date=event_date if event_date else "",
            event_time="",
            event_location=event_location if event_location else "Не указано",
            member_name=user.name,
            new_members_count=len(event_obj.members),
            event_url=f"{settings.APP_URL}{settings.EVENT_DETAIL_URL.format(event_id=event_obj.id)}"
        ))

    return event_response.model_copy(update={
        'is_user_in_event': True,
        'is_user_liked_event': user.id in [like.id for like in event_obj.likes]
    })


@router.get('/events/{event_id}/leave', response_model=EventResponse, status_code=status.HTTP_200_OK)
async def leave_event_request(
    session: SessionDependency,
    event_id: int,
    user: User = Depends(user_dependency),
) -> EventResponse:

    event_obj = await EventsService.leave_event(session, event_id, user=user)
    event_response = EventResponse.model_validate(event_obj)

    event_date = event_obj.start_date.strftime("%d.%m.%Y") if event_obj.start_date else ""
    event_location = event_obj.location if event_obj.location else ""

    admin_emails = await UsersService.get_admin_emails(session)
    for email in admin_emails:
        create_task(EmailService.send_event_member_cancelled_email(
            email=email,
            event_name=event_obj.name,
            event_date=event_date if event_date else "",
            event_time="",
            event_location=event_location if event_location else "Не указано",
            member_name=user.name,
            new_members_count=len(event_obj.members),
            event_url=f"{settings.APP_URL}{settings.EVENT_DETAIL_URL.format(event_id=event_obj.id)}"
        ))

    is_user_liked_event = user.id in [like.id for like in event_obj.likes]
    return event_response.model_copy(update={
        'is_user_in_event': False,
        'is_user_liked_event': is_user_liked_event
    })


@router.post("/events/{event_id}/like", response_model=EventResponse, status_code=status.HTTP_200_OK)
async def like_event_request(
    session: SessionDependency,
    event_id: int,
    user: User = Depends(user_dependency),
) -> EventResponse:

    event_obj = await EventsService.like_event(session, event_id, user=user)
    event_response = EventResponse.model_validate(event_obj)
    is_user_in_event = user.id in [member.id for member in event_obj.members]
    return event_response.model_copy(update={
        'is_user_in_event': is_user_in_event,
        'is_user_liked_event': True
    })


@router.delete("/events/{event_id}/unlike", response_model=EventResponse, status_code=status.HTTP_200_OK)
async def unlike_event_request(
    session: SessionDependency,
    event_id: int,
    user: User = Depends(user_dependency),
) -> EventResponse:
    event_obj = await EventsService.unlike_event(session, event_id, user=user)
    event_response = EventResponse.model_validate(event_obj)
    is_user_in_event = user.id in [member.id for member in event_obj.members]
    return event_response.model_copy(update={
        'is_user_in_event': is_user_in_event,
        'is_user_liked_event': False
    })


@router.post("/events/{event_id}/comment", response_model=EventResponse, status_code=status.HTTP_200_OK)
async def comment_event_request(
    session: SessionDependency,
    event_id: int,
    comment: EventCommentRequest,
    user: User = Depends(user_dependency),
) -> EventResponse:
    event_obj = await EventsService.comment_event(session, event_id, user=user, comment=comment)
    event_response = EventResponse.model_validate(event_obj)
    return event_response.model_copy(update={
        'is_user_in_event': user.id in [member.id for member in event_obj.members],
        'is_user_liked_event': user.id in [like.id for like in event_obj.likes]
    })


@router.get('/events/{event_id}/comments', response_model=List[EventCommentAdminResponse], status_code=status.HTTP_200_OK)
async def get_event_comments_request(
    session: SessionDependency,
    event_id: int,
    user: User = Depends(user_dependency),
) -> List[EventCommentAdminResponse]:
    comments = await EventsService.get_comments_for_event(session, event_id)
    comments_response = [EventCommentAdminResponse.model_validate(comment) for comment in comments]
    return comments_response
