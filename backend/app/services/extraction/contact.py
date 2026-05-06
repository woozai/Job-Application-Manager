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

    def response_json_schema(self) -> dict[str, Any]:
        nullable_string = {
            "type": ["string", "null"],
        }
        return {
            "type": "object",
            "properties": {
                "name": {
                    **nullable_string,
                    "description": "Person's full name from the public profile.",
                },
                "profile_link": {
                    **nullable_string,
                    "description": "Public profile URL when clearly present.",
                },
                "company": {
                    **nullable_string,
                    "description": "Current company if it is clearly stated.",
                },
                "job_title": {
                    **nullable_string,
                    "description": "Current role or headline from the profile.",
                },
                "relationship_type": {
                    **nullable_string,
                    "description": "Professional relationship category only if explicitly shown.",
                },
                "notes": {
                    **nullable_string,
                    "description": "Helpful short notes derived from profile text only.",
                },
            },
            "required": sorted(CONTACT_ALLOWED_FIELDS),
            "additionalProperties": False,
        }

    def normalize(self, payload: dict[str, Any]) -> ExtractionResult:
        data = {
            key: value for key, value in payload.items() if key in CONTACT_ALLOWED_FIELDS
        }
        return ExtractionResult(entity_type=self.entity_type, data=data)
