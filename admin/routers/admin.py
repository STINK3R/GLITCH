from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Body, File, status, HTTPException
from fastapi.responses import FileResponse
from fastapi.datastructures import UploadFile
from pydantic import ValidationError

from main.db.db import SessionDependency
from main.schemas.responses import MessageResponse
from events.enums.events import EventCity, EventType, EventStatus
from events.schemas.requests import EventRequest, EventUpdateRequest
from events.schemas.responses import EventResponse
from events.services.events import EventsService
from events.services.images import ImagesService
from admin.dependencies.admin import admin_dependency
from users.services.users import UsersService
from admin.schemas.responses import UserAdminResponse
from admin.schemas.requests import UserUpdateRequest

router = APIRouter()

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
    type: EventType = Body(...),
    city: EventCity = Body(...),
    # admin: User = Depends(admin_dependency),
    photo: UploadFile = File(...)
) -> EventResponse:

    try:
        event = EventRequest(
            name=name,
            start_date=start_date,
            end_date=end_date,
            description=description,
            short_description=short_description,
            location=location,
            pay_data=pay_data,
            max_members=max_members,
            type=type,
            city=city
        )
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

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

    try:
        event = EventUpdateRequest(
            name=name,
            start_date=start_date,
            end_date=end_date,
            description=description,
            short_description=short_description,
            location=location,
            pay_data=pay_data,
            max_members=max_members,
            city=city,
            status=EventStatus.ACTIVE
        )
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

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

@router.get('/events/{event_id}/members-csv', status_code=status.HTTP_200_OK)
async def get_event_members_csv_request(
    session: SessionDependency,
    event_id: int,
    # admin: User = Depends(admin_dependency),
) -> FileResponse:
    csv_path = await EventsService.export_event_members_to_csv(session, event_id)
    return FileResponse(path=str(csv_path), filename=f"members_event_{event_id}.csv")

@router.get('/events/{event_id}/members-excel', status_code=status.HTTP_200_OK)
async def get_event_members_excel_request(
    session: SessionDependency,
    event_id: int,
    # admin: User = Depends(admin_dependency),
) -> FileResponse:
    excel_path = await EventsService.export_event_members_to_excel(session, event_id)
    return FileResponse(path=str(excel_path), filename=f"members_event_{event_id}.xlsx")


@router.get('/users', response_model=List[UserAdminResponse], status_code=status.HTTP_200_OK)
async def get_users_request(
    session: SessionDependency,
    # admin: User = Depends(admin_dependency),
) -> List[UserAdminResponse]:
    users = await UsersService.get_users(session)
    users_response = [UserAdminResponse.model_validate(user) for user in users]
    return users_response

@router.put('/users/{user_id}', response_model=UserAdminResponse, status_code=status.HTTP_200_OK)
async def update_user_request(
    session: SessionDependency,
    new_data: UserUpdateRequest,
    # admin: User = Depends(admin_dependency),
) -> UserAdminResponse:
    user = await UsersService.update_user(session, user_id=new_data.id, new_data=new_data)
    return UserAdminResponse.model_validate(user)

# TODO: reset user password (admin print new password -> new password will be sent to user email)