import json
from fastapi import APIRouter, status, File, Form, HTTPException
from fastapi.datastructures import UploadFile
from pydantic import ValidationError
from main.db.db import SessionDependency
from events.services.events import EventsService
from events.services.images import ImagesService
from events.schemas.requests import EventRequest
from events.schemas.responses import EventResponse
router = APIRouter()

@router.get("/events", response_model=list[EventResponse], status_code=status.HTTP_200_OK)
async def get_events(session: SessionDependency) -> list[EventResponse]:
    events = await EventsService.get_events(session)

    return [EventResponse.model_validate(event) for event in events]


@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    session: SessionDependency,
    event: str = Form(...),
    photo: UploadFile = File(...)
) -> EventResponse:
    try:
        event_data = json.loads(event)
        event_request = EventRequest.model_validate(event_data)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid JSON format: {str(e)}"
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {e.errors()}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    image_path = await ImagesService.save_image(photo)
    event_obj = await EventsService.create_event(session, event_request, image_path)
    return EventResponse.model_validate(event_obj)
