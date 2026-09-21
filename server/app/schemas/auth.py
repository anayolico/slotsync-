from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.CLIENT
    category: Optional[str] = "General"
    title: Optional[str] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = 0.0
    slot_duration_minutes: Optional[int] = 30
