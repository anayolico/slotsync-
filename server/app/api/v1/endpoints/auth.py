from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User, UserRole
from app.models.creator import CreatorProfile
from app.models.device import FCMDevice
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.schemas.user import UserResponse
from app.schemas.device import DeviceRegisterRequest, DeviceResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new client or creator account.
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
        role=data.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # If registered as CREATOR, create CreatorProfile with specified or default fields
    if data.role == UserRole.CREATOR:
        creator_profile = CreatorProfile(
            user_id=user.id,
            category=data.category or "General",
            title=data.title or f"{data.full_name}'s Service",
            bio=data.bio or "Welcome to my SlotSync page. Book a slot below!",
            hourly_rate=data.hourly_rate if data.hourly_rate is not None else 0.0,
            slot_duration_minutes=data.slot_duration_minutes or 30,
        )
        db.add(creator_profile)
        await db.commit()

    return user


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
    # Check if token already exists
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
