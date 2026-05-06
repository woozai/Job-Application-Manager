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

    def response_json_schema(self) -> dict[str, Any]:
        nullable_string = {
            "type": ["string", "null"],
        }
        return {
            "type": "object",
            "properties": {
                "company_name": {
                    **nullable_string,
                    "description": "Hiring company name from the job page.",
                },
                "job_title": {
                    **nullable_string,
                    "description": "Job title exactly as shown on the page when possible.",
                },
                "location": {
                    **nullable_string,
                    "description": "Job location or geography shown on the page.",
                },
                "full_description": {
                    **nullable_string,
                    "description": "Readable full job description text summarized from the page without navigation noise.",
                },
                "required_skills": {
                    **nullable_string,
                    "description": "Comma-separated required skills or technologies explicitly mentioned on the page.",
                },
                "short_description": {
                    **nullable_string,
                    "description": "Short high-level summary of the role.",
                },
                "source": {
                    **nullable_string,
                    "description": "Source website name when it is clear from the page.",
                },
                "source_link": {
                    **nullable_string,
                    "description": "Source page URL when present in the content.",
                },
                "job_link": {
                    **nullable_string,
                    "description": "Canonical job posting URL when present in the content.",
                },
                "work_mode": {
                    **nullable_string,
                    "description": "Remote, onsite, hybrid, or null if unclear.",
                },
                "salary_range": {
                    **nullable_string,
                    "description": "Salary or compensation range only if stated clearly.",
                },
            },
            "required": sorted(JOB_APPLICATION_ALLOWED_FIELDS),
            "additionalProperties": False,
        }

    def normalize(self, payload: dict[str, Any]) -> ExtractionResult:
        data = {
            key: value
            for key, value in payload.items()
            if key in JOB_APPLICATION_ALLOWED_FIELDS
        }
        return ExtractionResult(entity_type=self.entity_type, data=data)
