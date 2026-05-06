from __future__ import annotations

from typing import Any
from typing import Literal

from app.services.extraction.types import ExtractionResult

JOB_APPLICATION_ALLOWED_FIELDS = {
    "company_name",
    "job_title",
    "location",
    "full_description",
    "required_skills",
    "short_description",
    "source",
    "source_link",
    "job_link",
    "work_mode",
    "salary_range",
}


class JobApplicationExtractionAdapter:
    entity_type: Literal["job_application"] = "job_application"

    def schema_instructions(self) -> str:
        return (
            "Extract job application fields as JSON. "
            "Use null for unknown values. "
            "Do not invent missing facts."
        )

    def normalize(self, payload: dict[str, Any]) -> ExtractionResult:
        data = {
            key: value
            for key, value in payload.items()
            if key in JOB_APPLICATION_ALLOWED_FIELDS
        }
        return ExtractionResult(entity_type=self.entity_type, data=data)
