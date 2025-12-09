from fastapi import APIRouter, Header, HTTPException, status

from main.db.db import SessionDependency
from users.schemas.requests import AuthRequest, RegisterRequest
from users.schemas.responses import MessageResponse, TokenResponse
from users.services.auth import AuthService
from users.services.users import UsersService

router = APIRouter()


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def register(request: RegisterRequest, session: SessionDependency):

    if request.password != request.repeat_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    if await UsersService.user_exists(session, request.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    await UsersService.create_user(session, request.username, request.password)

    return MessageResponse(message="User created successfuly")


@router.post("/auth", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def auth(request: AuthRequest, session: SessionDependency):

    is_valid, user_id = await UsersService.verify_user_password(session, request.username, request.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    token_data = {"sub": request.username, "id": user_id}
    access_token = AuthService.create_access_token(token_data)
    refresh_token = AuthService.create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        type="Bearer"
    )


@router.post("/refresh", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def refresh(session: SessionDependency, refresh_token: str = Header(...)):

    payload = AuthService.verify_token(refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    username = payload.get("sub")
    user_id = payload.get("id")
    if not username or not user_id or not await UsersService.user_exists(session, username):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    token_data = {"sub": username, "id": user_id}
    new_access_token = AuthService.create_access_token(token_data)
    new_refresh_token = AuthService.create_refresh_token(token_data)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        type="Bearer"
    )
