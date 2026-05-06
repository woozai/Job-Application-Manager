from __future__ import annotations

CONTACT_ALLOWED_FIELDS = {
    "name",
    "profile_link",
    "company",
    "job_title",
    "relationship_type",
    "notes",
}


def build_contact_response_json_schema() -> dict[str, object]:
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
