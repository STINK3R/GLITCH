from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Body, Depends, File, status
from fastapi.datastructures import UploadFile

from events.enums.events import EventCity, EventStatus
from events.schemas.requests import EventRequest
from events.schemas.responses import EventResponse
from events.services.events import EventsService
from events.services.images import ImagesService
from main.db.db import SessionDependency
from users.dependencies.users import user_dependency
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
    status: Optional[EventStatus] = None,
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
        status=status
    )

    return [EventResponse.model_validate(event) for event in events]


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
    user: User = Depends(user_dependency),
    photo: UploadFile = File(...)
) -> EventResponse:
    # if user.role != UserRole.ADMIN:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="You are not authorized to create an event"
    #     )

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
    return EventResponse.model_validate(event_obj)


# TODO: Update, delete event


@router.post("/events/{event_id}/join", response_model=EventResponse, status_code=status.HTTP_200_OK)
async def join_event_request(
    session: SessionDependency,
    event_id: int,
    user: User = Depends(user_dependency),
) -> EventResponse:

    event_obj = await EventsService.join_event(session, event_id, user=user)

    return EventResponse.model_validate(event_obj)


@router.get('events/{event_id}/leave', response_model=EventResponse, status_code=status.HTTP_200_OK)
async def leave_event_request(
    session: SessionDependency,
    event_id: int,
    user: User = Depends(user_dependency),
) -> EventResponse:

    event_obj = await EventsService.leave_event(session, event_id, user=user)

    return EventResponse.model_validate(event_obj)
