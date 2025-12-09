from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Body, Depends, File, status
from fastapi.datastructures import UploadFile

from events.enums.events import EventCity, EventStatus
from events.schemas.requests import EventRequest, EventUpdateRequest
from events.schemas.responses import EventResponse
from events.services.events import EventsService
from events.services.images import ImagesService
from main.db.db import SessionDependency
from main.schemas.responses import MessageResponse
from users.dependencies.users import admin_dependency, user_dependency
from users.models.user import User
from users.enums.user import UserRole
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


@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event_request(
    session: SessionDependency,
    name: str = Body(...),
    start_date: datetime = Body(...),
    end_date: datetime = Body(...),
    description: str = Body(...),
    short_description: Optional[str] = Body(None),
    location: Optional[str] = Body(None),
    pay_data: Optional[str] = Body(None),
    max_members: Optional[int] = Body(None),
    city: EventCity = Body(...),
    # admin: User = Depends(admin_dependency),
    photo: UploadFile = File(...)
) -> EventResponse:

    event = EventRequest(
        name=name,
        start_date=start_date,
        end_date=end_date,
        description=description,
        short_description=short_description,
        location=location,
        pay_data=pay_data,
        max_members=max_members,
        city=city
    )

    image_path = await ImagesService.save_image(photo)
    event_obj = await EventsService.create_event(session, event, image_path)
    event_response = EventResponse.model_validate(event_obj)
    return event_response.model_copy(update={'is_user_in_event': False})


@router.put('/events/{event_id}', response_model=EventResponse, status_code=status.HTTP_200_OK)
async def update_event_request(
    session: SessionDependency,
    event_id: int,
    name: str = Body(None),
    start_date: datetime = Body(None),
    end_date: datetime = Body(None),
    description: str = Body(None),
    short_description: Optional[str] = Body(None),
    location: Optional[str] = Body(None),
    pay_data: Optional[str] = Body(None),
    max_members: Optional[int] = Body(None),
    city: EventCity = Body(None),
    photo: UploadFile = File(None),
    # admin: User = Depends(admin_dependency),
) -> EventResponse:

    event = EventUpdateRequest(
        name=name,
        start_date=start_date,
        end_date=end_date,
        description=description,
        short_description=short_description,
        location=location,
        pay_data=pay_data,
        max_members=max_members,
        city=city
    )

    if photo:
        # TODO: Delete old image
        image_path = await ImagesService.save_image(photo)
        event.image_url = image_path

    event_obj = await EventsService.update_event(session, event_id, event)
    event_response = EventResponse.model_validate(event_obj)
    return event_response.model_copy(update={'is_user_in_event': False})

@router.delete('/events/{event_id}', response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def delete_event_request(
    session: SessionDependency,
    event_id: int,
    # admin: User = Depends(admin_dependency),
) -> MessageResponse:
    await EventsService.delete_event(session, event_id)
    return MessageResponse(message="Event deleted successfully")


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
