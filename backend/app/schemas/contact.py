from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import Field, field_validator

from app.schemas.base import BaseSchema
from app.schemas.validators import validate_optional_http_url, validate_optional_text, validate_required_text

CONTACT_RESPONSE_STATUSES = (
    "awaiting response",
    "replied",
    "resume forwarded",
    "no response",
    "declined",
    "referral offered",
)


def validate_response_status(value: object) -> str | None:
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError("Response status must be text")

    normalized_value = value.strip()

    if not normalized_value:
        return None

    if normalized_value not in CONTACT_RESPONSE_STATUSES:
        raise ValueError("Response status is not supported")

    return normalized_value


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
    notes: Optional[str] = Field(None, description="Additional notes about the contact")

    @field_validator("profile_link", mode="before")
    @classmethod
    def validate_profile_link(cls, value: object) -> str | None:
        return validate_optional_http_url(value)

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value: object) -> str:
        return validate_required_text(value, field_name="Name")

    @field_validator(
        "company",
        "job_title",
        "relationship_type",
        "priority",
        "notes",
        mode="before",
    )
    @classmethod
    def normalize_optional_text_fields(cls, value: object, info) -> str | None:
        return validate_optional_text(value, field_name=info.field_name.replace("_", " ").title())

    @field_validator("response_status", mode="before")
    @classmethod
    def validate_contact_response_status(cls, value: object) -> str | None:
        return validate_response_status(value)


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
    notes: Optional[str] = Field(None, description="Additional notes about the contact")
    job_application_id: Optional[int] = Field(
        None, description="ID of the associated job application"
    )

    @field_validator("profile_link", mode="before")
    @classmethod
    def validate_profile_link(cls, value: object) -> str | None:
        return validate_optional_http_url(value)

    @field_validator(
        "name",
        "company",
        "job_title",
        "relationship_type",
        "priority",
        "notes",
        mode="before",
    )
    @classmethod
    def normalize_optional_text_fields(cls, value: object, info) -> str | None:
        return validate_optional_text(value, field_name=info.field_name.replace("_", " ").title())

    @field_validator("response_status", mode="before")
    @classmethod
    def validate_contact_response_status(cls, value: object) -> str | None:
        return validate_response_status(value)


class ContactResponse(ContactBase):
    id: int = Field(..., description="Unique identifier for the contact")
    job_application_id: int = Field(
        ..., description="ID of the associated job application"
    )
    last_interaction_date: Optional[date] = Field(
        None, description="Automatically tracked date of last contact activity"
    )
    created_at: datetime = Field(
        ..., description="Timestamp when the contact was created"
    )
    updated_at: datetime = Field(
        ..., description="Timestamp when the contact was last updated"
    )
