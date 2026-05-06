from __future__ import annotations

from typing import Any
from typing import Literal

from app.services.extraction.entities.contact import (
    CONTACT_ALLOWED_FIELDS,
    build_contact_response_json_schema,
)
from app.services.extraction.types import ExtractionResult


class ContactExtractionAdapter:
    entity_type: Literal["contact"] = "contact"

    def schema_instructions(self) -> str:
        return (
            "Extract contact profile identity fields as JSON. "
            "Use null for unknown values. "
            "Do not infer outreach status fields."
        )

    def response_json_schema(self) -> dict[str, Any]:
        return build_contact_response_json_schema()

    def normalize(self, payload: dict[str, Any]) -> ExtractionResult:
        data = {
            key: value for key, value in payload.items() if key in CONTACT_ALLOWED_FIELDS
        }
        return ExtractionResult(entity_type=self.entity_type, data=data)
