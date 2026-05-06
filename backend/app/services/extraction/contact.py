from __future__ import annotations

from typing import Any
from typing import Literal

from app.services.extraction.types import ExtractionResult

CONTACT_ALLOWED_FIELDS = {
    "name",
    "profile_link",
    "company",
    "job_title",
    "relationship_type",
    "notes",
}


class ContactExtractionAdapter:
    entity_type: Literal["contact"] = "contact"

    def schema_instructions(self) -> str:
        return (
            "Extract contact profile identity fields as JSON. "
            "Use null for unknown values. "
            "Do not infer outreach status fields."
        )

    def normalize(self, payload: dict[str, Any]) -> ExtractionResult:
        data = {
            key: value for key, value in payload.items() if key in CONTACT_ALLOWED_FIELDS
        }
        return ExtractionResult(entity_type=self.entity_type, data=data)
