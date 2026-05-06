from __future__ import annotations

from app.services.extraction.entities.job_application import JOB_APPLICATION_MAX_FIELD_LENGTHS
from app.services.extraction.job_application import JobApplicationExtractionAdapter


def test_job_application_adapter_maps_primary_and_optional_fields() -> None:
    adapter = JobApplicationExtractionAdapter()

    result = adapter.normalize(
        {
            "company_name": "  Example Inc  ",
            "job_title": "\nSenior Backend Engineer\t",
            "location": " Tel Aviv, Israel ",
            "full_description": " Build APIs and internal tools. ",
            "required_skills": " Python, FastAPI, SQLAlchemy ",
            "short_description": " Backend role ",
            "source": " LinkedIn ",
            "source_link": "https://linkedin.com/jobs/view/123",
            "job_link": "https://example.com/jobs/123",
            "work_mode": " Hybrid ",
            "salary_range": " 30,000-40,000 ILS ",
            "ignored_field": "should not survive",
        }
    )

    assert result.entity_type == "job_application"
    assert result.data == {
        "company_name": "Example Inc",
        "job_title": "Senior Backend Engineer",
        "location": "Tel Aviv, Israel",
        "full_description": "Build APIs and internal tools.",
        "required_skills": "Python, FastAPI, SQLAlchemy",
        "short_description": "Backend role",
        "source": "LinkedIn",
        "source_link": "https://linkedin.com/jobs/view/123",
        "job_link": "https://example.com/jobs/123",
        "work_mode": "Hybrid",
        "salary_range": "30,000-40,000 ILS",
    }


def test_job_application_adapter_keeps_unknown_or_unsafe_optional_values_null() -> None:
    adapter = JobApplicationExtractionAdapter()

    result = adapter.normalize(
        {
            "company_name": "Example Inc",
            "job_title": "Backend Engineer",
            "location": "",
            "full_description": None,
            "required_skills": "   ",
            "short_description": 123,
            "source": None,
            "source_link": "javascript:alert(1)",
            "job_link": "ftp://example.com/job",
            "work_mode": "",
            "salary_range": None,
        }
    )

    assert result.data == {
        "company_name": "Example Inc",
        "job_title": "Backend Engineer",
        "location": None,
        "full_description": None,
        "required_skills": None,
        "short_description": None,
        "source": None,
        "source_link": None,
        "job_link": None,
        "work_mode": None,
        "salary_range": None,
    }


def test_job_application_adapter_caps_large_text_fields() -> None:
    adapter = JobApplicationExtractionAdapter()
    long_description = "A" * (JOB_APPLICATION_MAX_FIELD_LENGTHS["full_description"] + 50)
    long_skills = "B" * (JOB_APPLICATION_MAX_FIELD_LENGTHS["required_skills"] + 50)

    result = adapter.normalize(
        {
            "company_name": "Example Inc",
            "job_title": "Backend Engineer",
            "full_description": long_description,
            "required_skills": long_skills,
        }
    )

    assert result.data["full_description"] is not None
    assert result.data["required_skills"] is not None
    assert len(result.data["full_description"]) == JOB_APPLICATION_MAX_FIELD_LENGTHS["full_description"]
    assert len(result.data["required_skills"]) == JOB_APPLICATION_MAX_FIELD_LENGTHS["required_skills"]


def test_job_application_adapter_preserves_markdown_structure() -> None:
    adapter = JobApplicationExtractionAdapter()

    result = adapter.normalize(
        {
            "company_name": "Example Inc",
            "job_title": "Backend Engineer",
            "short_description": "## Summary\n\n- Python\n- FastAPI",
            "full_description": "# Role\n\nBuild APIs.\n\n## Responsibilities\n- Ship features\n- Write tests",
            "required_skills": "- Python\n- FastAPI\n- SQLAlchemy",
        }
    )

    assert result.data["short_description"] == "## Summary\n\n- Python\n- FastAPI"
    assert result.data["full_description"] == "# Role\n\nBuild APIs.\n\n## Responsibilities\n- Ship features\n- Write tests"
    assert result.data["required_skills"] == "- Python\n- FastAPI\n- SQLAlchemy"
