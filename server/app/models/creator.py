import uuid
from sqlalchemy import String, Float, Integer, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class CreatorProfile(Base):
    __tablename__ = "creator_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)  # Doctor, Lawyer, Barber, etc.
    title: Mapped[str] = mapped_column(String(100), nullable=True)  # e.g., "Senior Cardiologist", "Master Barber"
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    phone_number: Mapped[str] = mapped_column(String(50), nullable=True)
    consultation_mode: Mapped[str] = mapped_column(String(50), default="VIRTUAL")  # VIRTUAL, IN_PERSON, BOTH
    office_address: Mapped[str] = mapped_column(String(255), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    hourly_rate: Mapped[float] = mapped_column(Float, default=0.0)
    slot_duration_minutes: Mapped[int] = mapped_column(Integer, default=30)  # default slot length (30 min)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="creator_profile")
    availability_rules = relationship("AvailabilityRule", back_populates="creator", cascade="all, delete-orphan")
    creator_appointments = relationship("Appointment", foreign_keys="Appointment.creator_id", back_populates="creator")
