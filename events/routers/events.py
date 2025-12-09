from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, status

from events.enums.events import EventCity, EventStatus, EventType
from events.schemas.responses import EventResponse
from events.services.events import EventsService
from main.db.db import SessionDependency
from users.dependencies.users import user_dependency
from users.enums.user import UserRole
from users.models.user import User

router = APIRouter()


@router.get("/events", response_model=list[EventResponse], status_code=status.HTTP_200_OK)
async def get_events_request(
    session: SessionDependency,
    user: User = Depends(user_dependency),
    user_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    max_members: Optional[int] = None,
    name: Optional[str] = None,
    type: Optional[EventType] = None,
    status: Optional[EventStatus] = None,
    city: Optional[EventCity] = None,
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
        is_admin=user.role == UserRole.ADMIN
    )

    result = []
    for event in events:
        is_user_in_event = user.id in [
            member.id for member in event.members
        ]
        event_response = EventResponse.model_validate(event)
        result.append(event_response.model_copy(update={'is_user_in_event': is_user_in_event}))
    return result


@router.get('/events/{event_id}', response_model=EventResponse, status_code=status.HTTP_200_OK)
async def get_event_request(
    session: SessionDependency,
    event_id: int,
    user: User = Depends(user_dependency),
) -> EventResponse:
    event = await EventsService.get_event_by_id(session, event_id)
    event_response = EventResponse.model_validate(event)
    is_user_in_event = user.id in [member.id for member in event.members]
    return event_response.model_copy(update={'is_user_in_event': is_user_in_event})


@router.post("/events/{event_id}/join", response_model=EventResponse, status_code=status.HTTP_200_OK)
async def join_event_request(
    session: SessionDependency,
    event_id: int,
    user: User = Depends(user_dependency),
) -> EventResponse:

    event_obj = await EventsService.join_event(session, event_id, user=user)
    event_response = EventResponse.model_validate(event_obj)
    return event_response.model_copy(update={'is_user_in_event': True})


@router.get('/events/{event_id}/leave', response_model=EventResponse, status_code=status.HTTP_200_OK)
async def leave_event_request(
    session: SessionDependency,
    event_id: int,
    user: User = Depends(user_dependency),
) -> EventResponse:

    event_obj = await EventsService.leave_event(session, event_id, user=user)
    event_response = EventResponse.model_validate(event_obj)
    return event_response.model_copy(update={'is_user_in_event': False})
