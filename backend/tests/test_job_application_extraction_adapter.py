from __future__ import annotations

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
