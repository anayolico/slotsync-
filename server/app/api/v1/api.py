from fastapi import APIRouter
from app.api.v1.endpoints import auth, creators, availability, appointments, notifications

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth & User"])
api_router.include_router(creators.router, prefix="/creators", tags=["Creators Profile"])
api_router.include_router(availability.router, prefix="/availability", tags=["Availability & Slots"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

