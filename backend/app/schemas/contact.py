from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import Field, field_validator

from app.schemas.base import BaseSchema
from app.schemas.validators import validate_optional_http_url


class ContactBase(BaseSchema):
    name: str = Field(..., max_length=255, description="Name of the contact")
    profile_link: Optional[str] = Field(
        None, description="Link to the contact's profile"
    )
    company: Optional[str] = Field(
        None, max_length=255, description="Company where the contact works"
    )
    job_title: Optional[str] = Field(
        None, max_length=255, description="Job title of the contact"
    )
    relationship_type: Optional[str] = Field(
        None, max_length=100, description="Type of relationship with the contact"
    )
    priority: Optional[str] = Field(
        None, max_length=50, description="Priority level of the contact"
    )
    connection_requested_at: Optional[date] = Field(
        None, description="Date when connection was requested"
    )
    connection_approved: bool = Field(
        False, description="Whether the connection was approved"
    )
    connection_approved_at: Optional[date] = Field(
        None, description="Date when connection was approved"
    )
    message_sent: bool = Field(False, description="Whether a message was sent")
    message_sent_at: Optional[date] = Field(
        None, description="Date when message was sent"
    )
    response_status: Optional[str] = Field(
        None, max_length=100, description="Status of the response"
    )
    last_interaction_date: Optional[date] = Field(
        None, description="Date of last interaction"
    )
    notes: Optional[str] = Field(None, description="Additional notes about the contact")

    @field_validator("profile_link", mode="before")
    @classmethod
    def validate_profile_link(cls, value: object) -> str | None:
        return validate_optional_http_url(value)


class ContactCreate(ContactBase):
    job_application_id: int = Field(
        ..., description="ID of the associated job application"
    )


class ContactUpdate(BaseSchema):
    name: Optional[str] = Field(None, max_length=255, description="Name of the contact")
    profile_link: Optional[str] = Field(
        None, description="Link to the contact's profile"
    )
    company: Optional[str] = Field(
        None, max_length=255, description="Company where the contact works"
    )
    job_title: Optional[str] = Field(
        None, max_length=255, description="Job title of the contact"
    )
    relationship_type: Optional[str] = Field(
        None, max_length=100, description="Type of relationship with the contact"
    )
    priority: Optional[str] = Field(
        None, max_length=50, description="Priority level of the contact"
    )
    connection_requested_at: Optional[date] = Field(
        None, description="Date when connection was requested"
    )
    connection_approved: Optional[bool] = Field(
        None, description="Whether the connection was approved"
    )
    connection_approved_at: Optional[date] = Field(
        None, description="Date when connection was approved"
    )
    message_sent: Optional[bool] = Field(None, description="Whether a message was sent")
    message_sent_at: Optional[date] = Field(
        None, description="Date when message was sent"
    )
    response_status: Optional[str] = Field(
        None, max_length=100, description="Status of the response"
    )
    last_interaction_date: Optional[date] = Field(
        None, description="Date of last interaction"
    )
    notes: Optional[str] = Field(None, description="Additional notes about the contact")
    job_application_id: Optional[int] = Field(
        None, description="ID of the associated job application"
    )

    @field_validator("profile_link", mode="before")
    @classmethod
    def validate_profile_link(cls, value: object) -> str | None:
        return validate_optional_http_url(value)


class ContactResponse(ContactBase):
    id: int = Field(..., description="Unique identifier for the contact")
    job_application_id: int = Field(
        ..., description="ID of the associated job application"
    )
    created_at: datetime = Field(
        ..., description="Timestamp when the contact was created"
    )
    updated_at: datetime = Field(
        ..., description="Timestamp when the contact was last updated"
    )
