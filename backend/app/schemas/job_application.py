from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from app.schemas.base import BaseSchema
from app.schemas.contact import ContactResponse


class JobApplicationBase(BaseSchema):
    company_name: str
    job_title: str
    job_link: Optional[str] = None
    source_link: Optional[str] = None
    source: Optional[str] = None
    application_date: Optional[date] = None
    status: Optional[str] = "saved"
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    required_skills: Optional[str] = None
    notes: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    application_type: Optional[str] = None
    priority: Optional[str] = None
    salary_range: Optional[str] = None
    resume_version: Optional[str] = None
    recruiter_name: Optional[str] = None
    last_follow_up_date: Optional[date] = None
    next_action_date: Optional[date] = None
    interview_stage: Optional[str] = None
    rejection_reason: Optional[str] = None
    tags: Optional[str] = None


class JobApplicationCreate(JobApplicationBase):
    user_id: int


class JobApplicationUpdate(BaseSchema):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_link: Optional[str] = None
    source_link: Optional[str] = None
    source: Optional[str] = None
    application_date: Optional[date] = None
    status: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    required_skills: Optional[str] = None
    notes: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    application_type: Optional[str] = None
    priority: Optional[str] = None
    salary_range: Optional[str] = None
    resume_version: Optional[str] = None
    recruiter_name: Optional[str] = None
    last_follow_up_date: Optional[date] = None
    next_action_date: Optional[date] = None
    interview_stage: Optional[str] = None
    rejection_reason: Optional[str] = None
    tags: Optional[str] = None
    user_id: Optional[int] = None


class JobApplicationResponse(JobApplicationBase):
    id: int
    user_id: int
    contacts: List[ContactResponse] = []
    created_at: datetime
    updated_at: datetime
