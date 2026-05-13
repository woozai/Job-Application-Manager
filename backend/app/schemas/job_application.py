from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional

from pydantic import Field, field_validator

from app.schemas.base import BaseSchema
from app.schemas.contact import ContactResponse
from app.schemas.validators import (
    validate_optional_choice,
    validate_optional_http_url,
    validate_optional_text,
    validate_required_text,
)

JobApplicationStatus = Literal[
    "saved",
    "applied",
    "waiting",
    "connection requested",
    "connection accepted",
    "referral requested",
    "interview scheduled",
    "interview completed",
    "no longer open",
    "rejected",
    "offer",
    "archived",
]

JOB_APPLICATION_APPLICATION_TYPE_VALUES = (
    "recruiter",
    "direct_from_site",
    "through_connection",
)

JOB_APPLICATION_APPLICATION_TYPE_MAX_LENGTH = 50
JOB_APPLICATION_APPLICATION_TYPE_DESCRIPTION = (
    "Type of application (recruiter, direct_from_site, through_connection)"
)
JOB_APPLICATION_OPTIONAL_TEXT_FIELDS = (
    "source",
    "short_description",
    "full_description",
    "required_skills",
    "notes",
    "location",
    "work_mode",
    "priority",
    "salary_range",
    "resume_version",
    "recruiter_name",
    "interview_stage",
    "rejection_reason",
)
JOB_APPLICATION_UPDATE_OPTIONAL_TEXT_FIELDS = (
    "company_name",
    "job_title",
    *JOB_APPLICATION_OPTIONAL_TEXT_FIELDS,
    "archive_reason",
)


def _format_field_name(field_name: str) -> str:
    return field_name.replace("_", " ").title()


class JobApplicationValidationMixin(BaseSchema):
    application_type: Optional[str] = Field(
        None,
        max_length=JOB_APPLICATION_APPLICATION_TYPE_MAX_LENGTH,
        description=JOB_APPLICATION_APPLICATION_TYPE_DESCRIPTION,
    )

    @field_validator("job_link", mode="before", check_fields=False)
    @classmethod
    def validate_external_links(cls, value: object) -> str | None:
        return validate_optional_http_url(value)

    @field_validator("application_type", mode="before")
    @classmethod
    def validate_application_type_field(cls, value: object) -> str | None:
        return validate_optional_choice(
            value,
            field_name="Application Type",
            allowed_values=JOB_APPLICATION_APPLICATION_TYPE_VALUES,
        )


class JobApplicationBase(JobApplicationValidationMixin):
    company_name: str = Field(..., max_length=255, description="Name of the company")
    job_title: str = Field(..., max_length=255, description="Title of the job position")
    job_link: Optional[str] = Field(None, description="Link to the job posting")
    source: Optional[str] = Field(
        None, max_length=100, description="Source platform or website"
    )
    application_date: Optional[date] = Field(
        None, description="Date when the application was submitted"
    )
    status: JobApplicationStatus = Field(
        "saved", description="Current status of the application"
    )
    short_description: Optional[str] = Field(
        None, description="Brief description of the job"
    )
    full_description: Optional[str] = Field(None, description="Full job description")
    required_skills: Optional[str] = Field(
        None, description="Skills required for the job"
    )
    notes: Optional[str] = Field(
        None, description="Additional notes about the application"
    )
    location: Optional[str] = Field(None, max_length=255, description="Job location")
    work_mode: Optional[str] = Field(
        None, max_length=50, description="Work mode (remote, onsite, hybrid)"
    )
    priority: Optional[str] = Field(
        None, max_length=50, description="Priority level of the application"
    )
    salary_range: Optional[str] = Field(
        None, max_length=100, description="Expected salary range"
    )
    resume_version: Optional[str] = Field(
        None, max_length=100, description="Version of resume used"
    )
    recruiter_name: Optional[str] = Field(
        None, max_length=255, description="Name of the recruiter"
    )
    last_follow_up_date: Optional[date] = Field(
        None, description="Date of last follow-up"
    )
    next_action_date: Optional[date] = Field(
        None, description="Date of next planned action"
    )
    interview_stage: Optional[str] = Field(
        None, max_length=100, description="Current interview stage"
    )
    rejection_reason: Optional[str] = Field(
        None, description="Reason for rejection if applicable"
    )

    @field_validator("company_name", "job_title", mode="before")
    @classmethod
    def validate_required_text_fields(cls, value: object, info) -> str:
        return validate_required_text(value, field_name=_format_field_name(info.field_name))

    @field_validator(*JOB_APPLICATION_OPTIONAL_TEXT_FIELDS, mode="before")
    @classmethod
    def normalize_optional_text_fields(cls, value: object, info) -> str | None:
        return validate_optional_text(value, field_name=_format_field_name(info.field_name))


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(JobApplicationValidationMixin):
    company_name: Optional[str] = Field(
        None, max_length=255, description="Name of the company"
    )
    job_title: Optional[str] = Field(
        None, max_length=255, description="Title of the job position"
    )
    job_link: Optional[str] = Field(None, description="Link to the job posting")
    source: Optional[str] = Field(
        None, max_length=100, description="Source platform or website"
    )
    application_date: Optional[date] = Field(
        None, description="Date when the application was submitted"
    )
    status: Optional[JobApplicationStatus] = Field(
        None, description="Current status of the application"
    )
    short_description: Optional[str] = Field(
        None, description="Brief description of the job"
    )
    full_description: Optional[str] = Field(None, description="Full job description")
    required_skills: Optional[str] = Field(
        None, description="Skills required for the job"
    )
    notes: Optional[str] = Field(
        None, description="Additional notes about the application"
    )
    location: Optional[str] = Field(None, max_length=255, description="Job location")
    work_mode: Optional[str] = Field(
        None, max_length=50, description="Work mode (remote, onsite, hybrid)"
    )
    priority: Optional[str] = Field(
        None, max_length=50, description="Priority level of the application"
    )
    salary_range: Optional[str] = Field(
        None, max_length=100, description="Expected salary range"
    )
    resume_version: Optional[str] = Field(
        None, max_length=100, description="Version of resume used"
    )
    recruiter_name: Optional[str] = Field(
        None, max_length=255, description="Name of the recruiter"
    )
    last_follow_up_date: Optional[date] = Field(
        None, description="Date of last follow-up"
    )
    next_action_date: Optional[date] = Field(
        None, description="Date of next planned action"
    )
    interview_stage: Optional[str] = Field(
        None, max_length=100, description="Current interview stage"
    )
    rejection_reason: Optional[str] = Field(
        None, description="Reason for rejection if applicable"
    )
    is_archived: Optional[bool] = Field(
        None, description="Whether the job is archived from the active dashboard"
    )
    archived_at: Optional[datetime] = Field(
        None, description="When the job was archived"
    )
    archive_reason: Optional[str] = Field(
        None, description="Optional reason for archiving the job"
    )

    @field_validator(*JOB_APPLICATION_UPDATE_OPTIONAL_TEXT_FIELDS, mode="before")
    @classmethod
    def normalize_optional_text_fields(cls, value: object, info) -> str | None:
        return validate_optional_text(value, field_name=_format_field_name(info.field_name))


class JobApplicationResponse(JobApplicationBase):
    id: int = Field(..., description="Unique identifier for the job application")
    user_id: int = Field(..., description="ID of the user who owns the application")
    is_archived: bool = Field(
        ..., description="Whether the job is archived from the active dashboard"
    )
    archived_at: Optional[datetime] = Field(
        None, description="When the job was archived"
    )
    archive_reason: Optional[str] = Field(
        None, description="Optional reason for archiving the job"
    )
    contacts: list[ContactResponse] = Field(
        default_factory=list,
        description="List of contacts associated with the application",
    )
    created_at: datetime = Field(
        ..., description="Timestamp when the application was created"
    )
    updated_at: datetime = Field(
        ..., description="Timestamp when the application was last updated"
    )
