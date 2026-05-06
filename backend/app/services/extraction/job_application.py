from __future__ import annotations

from typing import Any
from typing import Literal

from app.services.extraction.entities.job_application import (
    JOB_APPLICATION_FIELD_ORDER,
    JOB_APPLICATION_MAX_FIELD_LENGTHS,
    JOB_APPLICATION_PRIMARY_FIELDS,
    JOB_APPLICATION_URL_FIELDS,
    build_job_application_response_json_schema,
)
from app.services.extraction.normalizers import normalize_http_url, normalize_text
from app.services.extraction.types import ExtractionResult


class JobApplicationExtractionAdapter:
    entity_type: Literal["job_application"] = "job_application"

    def schema_instructions(self) -> str:
        return (
            "Extract job application fields as JSON. "
            "Use null for unknown values. "
            "Do not invent missing facts."
        )

    def response_json_schema(self) -> dict[str, Any]:
        return build_job_application_response_json_schema()

    def warning_fields(self) -> set[str]:
        return JOB_APPLICATION_PRIMARY_FIELDS

    def normalize(self, payload: dict[str, Any]) -> ExtractionResult:
        data: dict[str, Any] = {}
        for field_name in JOB_APPLICATION_FIELD_ORDER:
            raw_value = payload.get(field_name)
            if field_name in JOB_APPLICATION_URL_FIELDS:
                normalized_value = normalize_http_url(raw_value)
            else:
                normalized_value = normalize_text(
                    raw_value,
                    max_length=JOB_APPLICATION_MAX_FIELD_LENGTHS.get(field_name),
                )

            data[field_name] = normalized_value

        return ExtractionResult(entity_type=self.entity_type, data=data)
