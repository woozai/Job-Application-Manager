from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import Field

from app.schemas.base import BaseSchema
from app.schemas.contact import ContactResponse


class JobApplicationBase(BaseSchema):
    company_name: str = Field(..., max_length=255, description="Name of the company")
    job_title: str = Field(..., max_length=255, description="Title of the job position")
    job_link: Optional[str] = Field(None, description="Link to the job posting")
    source_link: Optional[str] = Field(
        None, description="Link to the source where the job was found"
    )
    source: Optional[str] = Field(
        None, max_length=100, description="Source platform or website"
    )
    application_date: Optional[date] = Field(
        None, description="Date when the application was submitted"
    )
    status: Optional[str] = Field(
        "saved", max_length=100, description="Current status of the application"
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
    application_type: Optional[str] = Field(
        None, max_length=50, description="Type of application (direct, referral, etc.)"
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
    tags: Optional[str] = Field(
        None, description="Tags associated with the application"
    )


class JobApplicationCreate(JobApplicationBase):
    user_id: int = Field(..., description="ID of the user creating the application")


class JobApplicationUpdate(BaseSchema):
    company_name: Optional[str] = Field(
        None, max_length=255, description="Name of the company"
    )
    job_title: Optional[str] = Field(
        None, max_length=255, description="Title of the job position"
    )
    job_link: Optional[str] = Field(None, description="Link to the job posting")
    source_link: Optional[str] = Field(
        None, description="Link to the source where the job was found"
    )
    source: Optional[str] = Field(
        None, max_length=100, description="Source platform or website"
    )
    application_date: Optional[date] = Field(
        None, description="Date when the application was submitted"
    )
    status: Optional[str] = Field(
        None, max_length=100, description="Current status of the application"
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
    application_type: Optional[str] = Field(
        None, max_length=50, description="Type of application (direct, referral, etc.)"
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
    tags: Optional[str] = Field(
        None, description="Tags associated with the application"
    )
    user_id: Optional[int] = Field(None, description="ID of the user")


class JobApplicationResponse(JobApplicationBase):
    id: int = Field(..., description="Unique identifier for the job application")
    user_id: int = Field(..., description="ID of the user who owns the application")
    contacts: List[ContactResponse] = Field(
        default_factory=list,
        description="List of contacts associated with the application",
    )
    created_at: datetime = Field(
        ..., description="Timestamp when the application was created"
    )
    updated_at: datetime = Field(
        ..., description="Timestamp when the application was last updated"
    )
