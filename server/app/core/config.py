from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SlotSync API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./slotsync.db"

    # JWT Security
    SECRET_KEY: str = "slotsync_super_secret_jwt_key_change_in_production_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Firebase Cloud Messaging (FCM)
    FIREBASE_CREDENTIALS_FILE: Optional[str] = None

    # SMTP Email Configuration (VPS / Production)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True
    EMAILS_FROM_EMAIL: str = "noreply@slotsync.app"
    EMAILS_FROM_NAME: str = "SlotSync Verification"

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
