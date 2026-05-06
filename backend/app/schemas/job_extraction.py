from __future__ import annotations

from pydantic import Field, HttpUrl, field_validator

from app.schemas.base import BaseSchema
from app.schemas.validators import validate_optional_text


class JobFromLinkRequest(BaseSchema):
    url: HttpUrl
    raw_text: str | None = Field(
        default=None,
        description="Optional pasted job description used when the page content is blocked or incomplete.",
    )

    @field_validator("raw_text", mode="before")
    @classmethod
    def normalize_raw_text(cls, value: object) -> str | None:
        return validate_optional_text(value, field_name="Raw text")


class JobExtractionData(BaseSchema):
    company_name: str | None = None
    job_title: str | None = None
    location: str | None = None
    full_description: str | None = None
    required_skills: str | None = None
    short_description: str | None = None
    source: str | None = None
    job_link: str | None = None
    work_mode: str | None = None
    salary_range: str | None = None


class JobFromLinkResponse(BaseSchema):
    data: JobExtractionData
    warnings: list[str] = Field(default_factory=list)
