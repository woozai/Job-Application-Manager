from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import Field

from app.schemas.base import BaseSchema


class ContactBase(BaseSchema):
    name: str
    profile_link: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    relationship_type: Optional[str] = None
    priority: Optional[str] = None
    connection_requested_at: Optional[date] = None
    connection_approved: bool = False
    connection_approved_at: Optional[date] = None
    message_sent: bool = False
    message_sent_at: Optional[date] = None
    response_status: Optional[str] = None
    last_interaction_date: Optional[date] = None
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    job_application_id: int


class ContactUpdate(BaseSchema):
    name: Optional[str] = None
    profile_link: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    relationship_type: Optional[str] = None
    priority: Optional[str] = None
    connection_requested_at: Optional[date] = None
    connection_approved: Optional[bool] = None
    connection_approved_at: Optional[date] = None
    message_sent: Optional[bool] = None
    message_sent_at: Optional[date] = None
    response_status: Optional[str] = None
    last_interaction_date: Optional[date] = None
    notes: Optional[str] = None
    job_application_id: Optional[int] = None


class ContactResponse(ContactBase):
    id: int
    job_application_id: int
    created_at: datetime
    updated_at: datetime
