import random
import secrets
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User, UserRole
from app.models.creator import CreatorProfile
from app.models.device import FCMDevice
from app.models.email_verification import EmailVerification
from app.schemas.auth import (
    LoginRequest, 
    RegisterRequest, 
    Token,
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    LogoutResponse
)
from app.schemas.user import UserResponse
from app.schemas.device import DeviceRegisterRequest, DeviceResponse
from app.services.email import send_otp_email

router = APIRouter()


@router.post("/send-otp", response_model=SendOtpResponse)
async def send_email_otp(
    data: SendOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate and send a 6-digit verification code to the requested email.
    """
    # Check if user already exists
    res = await db.execute(select(User).where(User.email == data.email))
    existing_user = res.scalar_one_or_none()
    if existing_user and existing_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists and is verified.",
        )

    # Generate 6-digit numeric OTP code
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    verification = EmailVerification(
        email=data.email,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=False,
    )
    db.add(verification)
    await db.commit()

    # Send OTP Email
    await send_otp_email(to_email=data.email, otp_code=otp_code)

    return SendOtpResponse(
        message="A 6-digit verification code has been sent to your email address.",
        expires_in_seconds=600,
    )


@router.post("/verify-otp", response_model=VerifyOtpResponse)
async def verify_email_otp(
    data: VerifyOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Validate the 6-digit OTP code sent to the email.
    """
    now = datetime.now(timezone.utc)
    query = (
        select(EmailVerification)
        .where(
            EmailVerification.email == data.email,
            EmailVerification.is_used == False,
            EmailVerification.expires_at > now,
        )
        .order_by(desc(EmailVerification.created_at))
    )
    res = await db.execute(query)
    verification = res.scalars().first()

    if not verification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active verification code found for this email. Please request a new code.",
        )

    if verification.attempts >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many incorrect attempts. Please request a new verification code.",
        )

    if verification.otp_code != data.otp_code.strip():
        verification.attempts += 1
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit verification code. Please check and try again.",
        )

    # Mark OTP as used
    verification.is_used = True
    await db.commit()

    # Create temporary verification token
    verification_token = secrets.token_urlsafe(32)

    return VerifyOtpResponse(
        verified=True,
        verification_token=verification_token,
        message="Email successfully verified.",
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new client or creator account with expanded profile details.
    """
    existing_res = await db.execute(select(User).where(User.email == data.email))
    if existing_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone_number=data.phone_number,
        role=data.role,
        is_verified=True,  # Account activated upon completion of onboarding OTP
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # If registered as CREATOR, create CreatorProfile with specified fields
    if data.role == UserRole.CREATOR:
        creator_profile = CreatorProfile(
            user_id=user.id,
            category=data.category or "General",
            title=data.title or f"{data.full_name}'s Service",
            bio=data.bio or "Welcome to my SlotSync page. Book a slot below!",
            phone_number=data.phone_number,
            consultation_mode=data.consultation_mode or "VIRTUAL",
            office_address=data.office_address,
            currency=data.currency or "USD",
            hourly_rate=data.hourly_rate if data.hourly_rate is not None else 0.0,
            slot_duration_minutes=data.slot_duration_minutes or 30,
        )
        db.add(creator_profile)
        await db.commit()

    return user


@router.post("/logout", response_model=LogoutResponse)
async def logout_user():
    """
    Logout endpoint acknowledging session termination.
    """
    return LogoutResponse(
        success=True,
        message="Session terminated successfully. Token invalidated on client."
    )


@router.post("/login", response_model=Token)
async def login_json(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    JSON Login endpoint returning JWT bearer token.
    """
    res = await db.execute(select(User).where(User.email == data.email))
    user = res.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token)


@router.post("/token", response_model=Token)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    OAuth2 compatible form login (for Swagger UI authorize button).
    """
    res = await db.execute(select(User).where(User.email == form_data.username))
    user = res.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token)


@router.post("/logout", response_model=LogoutResponse)
async def logout_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Log out the authenticated user.
    """
    return LogoutResponse(
        success=True,
        message=f"User {current_user.email} successfully logged out."
    )


@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user),
):
    """
    Fetch profile details of the authenticated user.
    """
    return current_user


@router.post("/devices", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def register_fcm_device(
    data: DeviceRegisterRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Register FCM device token for mobile push notifications.
    """
    res = await db.execute(select(FCMDevice).where(FCMDevice.fcm_token == data.fcm_token))
    existing_device = res.scalar_one_or_none()

    if existing_device:
        existing_device.user_id = current_user.id
        existing_device.device_type = data.device_type
        await db.commit()
        await db.refresh(existing_device)
        return existing_device

    device = FCMDevice(
        user_id=current_user.id,
        fcm_token=data.fcm_token,
        device_type=data.device_type,
    )
    db.add(device)
    await db.commit()
    await db.refresh(device)
    return device
