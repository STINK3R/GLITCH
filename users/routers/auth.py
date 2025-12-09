from fastapi import APIRouter, Header, HTTPException, status

from main.db.db import SessionDependency
from users.schemas.requests import (
    AuthRequest,
    RegisterConfirmRequest,
    RegisterRequest,
    ResetPasswordApplyRequest,
    ResetPasswordRequest,
)
from users.schemas.responses import MessageResponse, TokenResponse
from users.services.auth import AuthService
from users.services.email import EmailService
from users.services.users import UsersService

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

    verification_code = AuthService.generate_verification_code()

    # TODO: Make background task for sending email
    email_sent = await EmailService.send_verification_email(
        email=request.email,
        verification_code=verification_code
    )

    # TODO: Make secure dictionary
    user_verification_codes[request.email] = {
        'code': AuthService.get_hash(verification_code),
        'password': request.password,
        'repeat_password': request.repeat_password,
        'name': request.name,
        'surname': request.surname,
        'father_name': request.father_name,
        'email': request.email,
        'attempts': 3,
    }
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please check server logs."
        )

    return MessageResponse(message="Verification email sent")


@router.post("/register/confirm", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def register_confirm_request(request: RegisterConfirmRequest, session: SessionDependency):

    user_dict = user_verification_codes.get(request.email)

    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )

    if user_dict['attempts'] <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many attempts"
        )

    if not AuthService.verify_hash(request.code, user_dict['code']):
        user_dict['attempts'] -= 1
        if user_dict['attempts'] <= 0:
            user_verification_codes.pop(request.email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"

        )

    user = RegisterRequest(
        name=user_dict['name'],
        surname=user_dict['surname'],
        father_name=user_dict['father_name'],
        email=user_dict['email'],
        password=user_dict['password'],
        repeat_password=user_dict['repeat_password'],
    )

    await UsersService.create_user(
        session=session,
        new_user=user
    )

    # TODO: Make background task for sending email
    await EmailService.send_welcome_email(
        email=user_dict['email']
    )

    user_verification_codes.pop(request.email)

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
    payload = AuthService.verify_token(token=refresh_token, token_type="refresh")
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


@router.post('/reset-password', response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def reset_password_request(email: ResetPasswordRequest, session: SessionDependency):
    if not await UsersService.user_exists(
        session=session,
        email=email.email
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )

    reset_token = AuthService.generate_reset_token(email.email)

    # TODO: Make background task for sending email
    await EmailService.send_password_reset_email(
        email=email.email,
        reset_token=reset_token,
    )

    return MessageResponse(message="Password reset email sent")


@router.post('/reset-password/apply', response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def reset_password_apply_request(data: ResetPasswordApplyRequest, session: SessionDependency):

    auth_payload = AuthService.verify_token(token=data.reset_token, token_type="reset")
    if not auth_payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )

    email = auth_payload.get("sub")
    if not email or not isinstance(email, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )

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

    # TODO: Make background task for sending email
    await EmailService.send_password_reset_success_email(
        email=email
    )

    return MessageResponse(message="Password reset successfuly")


# TODO: Add reset email route
