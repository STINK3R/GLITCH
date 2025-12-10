from typing import List, Optional
from datetime import datetime
import json
from fastapi import APIRouter, Body, File, status, HTTPException
from fastapi.responses import FileResponse
from fastapi.datastructures import UploadFile
from asyncio import create_task
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
from admin.schemas.requests import UserUpdateRequest, ResetUserPasswordRequest
from notifications.services.email import EmailService
from main.config.settings import settings

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
    invited_users: Optional[str] = Body(None),
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

    # Parse invited_users from JSON string
    invited_users_list: Optional[List[int]] = None
    if invited_users:
        try:
            invited_users_list = json.loads(invited_users)
            if not isinstance(invited_users_list, list):
                raise ValueError("invited_users must be a JSON array")
            invited_users_list = [int(uid) for uid in invited_users_list]
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid invited_users format: {str(e)}. Expected JSON array, e.g. [1, 2, 3]"
            )

    image_path = await ImagesService.save_image(photo)
    event_obj = await EventsService.create_event(session, event, image_path)

    if invited_users_list:
        for user_id in invited_users_list:
            try:
                user = await UsersService.get_user_by_id(session, user_id)
            except HTTPException:
                continue
            if user:
                formatted_event_date = event.start_date.strftime("%d.%m.%Y")
                formatted_event_time = event.start_date.strftime("%H:%M")
                create_task(EmailService.send_event_created_email(
                    email=user.email,
                    event_name=event.name,
                    event_date=formatted_event_date,
                    event_time=formatted_event_time,
                    event_location=event.location if event.location else "Не указано",
                    max_participants=event.max_members if event.max_members else "Не указано",
                    event_description=event.description if event.description else "Не указано",
                    event_url=f"{settings.APP_URL}{settings.EVENT_DETAIL_URL.format(event_id=event_obj.id)}"
                ))

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
    status: EventStatus = Body(None),
    # admin: User = Depends(admin_dependency),
) -> EventResponse:

    try:
        new_event = EventUpdateRequest(
            name=name,
            start_date=start_date,
            end_date=end_date,
            description=description,
            short_description=short_description,
            location=location,
            pay_data=pay_data,
            max_members=max_members,
            city=city,
            status=status
        )
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    
    event = await EventsService.get_event_by_id(session, event_id)

    if status == EventStatus.CANCELLED and event.status != EventStatus.CANCELLED:
        members = await EventsService.get_event_members(session, event_id)
        for member in members:
            formatted_event_date = event.start_date.strftime("%d.%m.%Y")
            formatted_event_time = event.start_date.strftime("%H:%M")
            create_task(EmailService.send_event_cancelled_email(
                email=member.email,
                event_name=new_event.name,
                event_date=formatted_event_date,
                event_location=new_event.location if new_event.location else "Не указано",  
                event_url=f"{settings.APP_URL}{settings.EVENT_DETAIL_URL.format(event_id=event_id)}"
            ))
    else:
        members = await EventsService.get_event_members(session, event_id)
        for member in members:
            formatted_event_date = event.start_date.strftime("%d.%m.%Y")
            formatted_event_time = event.start_date.strftime("%H:%M")
            create_task(EmailService.send_event_updated_email(
                email=member.email,
                event_name=event.name,
                old_date=formatted_event_date,
                new_date=formatted_event_date,
                old_location=event.location if event.location else "Не указано",
                new_location=new_event.location if new_event.location else "Не указано",
                new_description=new_event.description if new_event.description else "Не указано",
                event_url=f"{settings.APP_URL}{settings.EVENT_DETAIL_URL.format(event_id=event_id)}"
            ))

    if photo:
        # TODO: Delete old image
        image_path = await ImagesService.save_image(photo)
        event.image_url = image_path

    event_obj = await EventsService.update_event(session, event=event, event_request=new_event)
    event_response = EventResponse.model_validate(event_obj)
    return event_response.model_copy(update={'is_user_in_event': False})

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

@router.post('/users/{user_id}/reset-password', response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def reset_user_password_request(
    session: SessionDependency,
    user_id: int,
    request: ResetUserPasswordRequest,
    # admin: User = Depends(admin_dependency),
) -> MessageResponse:
    user = await UsersService.get_user_by_id(session, user_id)
    await UsersService.reset_password(session, email=user.email, new_password=request.new_password)
    create_task(EmailService.send_admin_reset_password_email(
        email=user.email,
        new_password=request.new_password
    ))
    return MessageResponse(message="Password reset successfully")