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


class SendOtpRequest(BaseModel):
    email: EmailStr


class SendOtpResponse(BaseModel):
    message: str
    expires_in_seconds: int = 600


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str


class VerifyOtpResponse(BaseModel):
    verified: bool
    verification_token: str
    message: str


class LogoutResponse(BaseModel):
    success: bool = True
    message: str = "Successfully logged out."


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: Optional[str] = None
    role: UserRole = UserRole.CLIENT
    
    # Creator Specific Fields
    category: Optional[str] = "General"
    title: Optional[str] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = 0.0
    slot_duration_minutes: Optional[int] = 30
    consultation_mode: Optional[str] = "VIRTUAL"
    office_address: Optional[str] = None
    currency: Optional[str] = "USD"
    
    # Optional Verification Token
    verification_token: Optional[str] = None
