from fastapi import APIRouter, Header, HTTPException, status

from main.db.db import SessionDependency
from users.schemas.requests import (AuthRequest, 
                                    RegisterRequest, 
                                    RegisterConfirmRequest,
                                    ResetPasswordRequest,
                                    ResetPasswordApplyRequest,
                                    )
from users.schemas.responses import MessageResponse, TokenResponse
from users.services.auth import AuthService
from users.services.users import UsersService
from users.services.email import EmailService

router = APIRouter()

user_verification_codes = {}

@router.post("/register/request", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def register_request(request: RegisterRequest, session: SessionDependency):

    if request.password != request.repeat_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    if await UsersService.user_exists(
        session=session, 
        email=request.email
        ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    email_sent = await EmailService.send_verification_email(
        email=request.email, 
        verification_code='123456'
        )

    # TODO: Save user to dictionary

    user_verification_codes[request.email] = {
        'code': '123456',
        'password': request.password,
        'repeat_password': request.repeat_password,
        'name': request.name,
        'surname': request.surname,
        'father_name': request.father_name,
        'email': request.email,
    }
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please check server logs."
        )

    return MessageResponse(message="Verification email sent")


@router.post("/register/confirm", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def register_confirm_request(request: RegisterConfirmRequest, session: SessionDependency):
    
    #TODO Verify email
    #TODO Activate user

    user_dict = user_verification_codes.get(request.email)

    user = RegisterRequest(
        name=user_dict['name'],
        surname=user_dict['surname'],
        father_name=user_dict['father_name'],
        email=user_dict['email'],
        password=user_dict['password'],
        repeat_password=user_dict['repeat_password'],
    )

    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )
    
    await UsersService.create_user(
        session=session, 
        new_user=user
        )

    return MessageResponse(message="User created successfuly")



@router.post("/auth", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def auth_request(request: AuthRequest, session: SessionDependency):

    is_valid, user_id = await UsersService.verify_user_password(
        session=session, 
        email=request.email, 
        password=request.password
        )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token_data = {"sub": request.email, "id": user_id}
    access_token = AuthService.create_access_token(token_data)
    refresh_token = AuthService.create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        type="Bearer"
    )


@router.post("/refresh", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def refresh_request(session: SessionDependency, refresh_token: str = Header(...)):

    payload = AuthService.verify_token(refresh_token=refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    email = payload.get("sub")
    user_id = payload.get("id")
    if not email or not user_id or not await UsersService.user_exists(
        session=session, 
        email=email
        ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    token_data = {"sub": email, "id": user_id}
    new_access_token = AuthService.create_access_token(token_data)
    new_refresh_token = AuthService.create_refresh_token(token_data)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        type="Bearer"
    )


@router.get('/reset-password', response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def reset_password_request(email: ResetPasswordRequest, session: SessionDependency):
    if not await UsersService.user_exists(
        session=session, 
        email=email.email
        ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )

    # TODO: generate reset token
    # TODO: Send email with link to reset password

    return MessageResponse(message="Password reset email sent")


@router.post('/reset-password/apply', response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def reset_password_apply_request(data: ResetPasswordApplyRequest, session: SessionDependency):
    # TODO Verify token
    # TODO Get email from token
    email = ''
    if not await UsersService.user_exists(
        session=session, 
        email=email
        ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )

    await UsersService.reset_password(
        session=session, 
        email=email, 
        new_password=data.password
        )

    return MessageResponse(message="Password reset successfuly")