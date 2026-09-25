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


class ForgotPasswordSendOtpRequest(BaseModel):
    identifier: str  # Email or phone number


class ForgotPasswordSendOtpResponse(BaseModel):
    message: str
    email: str
    masked_email: str
    full_name: str
    role: str
    expires_in_seconds: int = 600


class ForgotPasswordVerifyOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str


class ForgotPasswordVerifyOtpResponse(BaseModel):
    verified: bool
    reset_token: str
    message: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str
    new_password: str


class ResetPasswordResponse(BaseModel):
    success: bool = True
    message: str


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None


class DeleteAccountSendOtpResponse(BaseModel):
    message: str
    masked_email: str
    expires_in_seconds: int = 600


class DeleteAccountConfirmRequest(BaseModel):
    otp_code: str
    reason: Optional[str] = None
    feedback: Optional[str] = None


class DeleteAccountConfirmResponse(BaseModel):
    success: bool = True
    message: str


