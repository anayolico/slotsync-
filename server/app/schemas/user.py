from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr
from app.models.user import UserRole


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    role: UserRole
    is_verified: bool = False
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
