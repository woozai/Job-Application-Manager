from __future__ import annotations

JOB_APPLICATION_PRIMARY_FIELDS = {
    "company_name",
    "job_title",
    "location",
    "full_description",
    "required_skills",
}

JOB_APPLICATION_OPTIONAL_FIELDS = {
    "short_description",
    "source",
    "job_link",
    "work_mode",
    "salary_range",
}

JOB_APPLICATION_ALLOWED_FIELDS = JOB_APPLICATION_PRIMARY_FIELDS | JOB_APPLICATION_OPTIONAL_FIELDS

JOB_APPLICATION_FIELD_ORDER = [
    "company_name",
    "job_title",
    "location",
    "full_description",
    "required_skills",
    "short_description",
    "source",
    "job_link",
    "work_mode",
    "salary_range",
]

JOB_APPLICATION_URL_FIELDS = {"job_link"}

JOB_APPLICATION_MAX_FIELD_LENGTHS = {
    "company_name": 255,
    "job_title": 255,
    "location": 255,
    "short_description": 2000,
    "source": 100,
    "job_link": 2048,
    "work_mode": 50,
    "salary_range": 100,
    "full_description": 10000,
    "required_skills": 2000,
}


def build_job_application_response_json_schema() -> dict[str, object]:
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
                "description": "Readable full job description in Markdown, preserving useful paragraphs and bullet lists from the page without navigation noise.",
            },
            "required_skills": {
                **nullable_string,
                "description": "Required skills or technologies explicitly mentioned on the page, formatted as Markdown when a list is helpful.",
            },
            "short_description": {
                **nullable_string,
                "description": "Short high-level Markdown summary of the role.",
            },
            "source": {
                **nullable_string,
                "description": "Source website name when it is clear from the page.",
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
        "required": JOB_APPLICATION_FIELD_ORDER,
        "additionalProperties": False,
    }
