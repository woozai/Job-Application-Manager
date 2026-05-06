from __future__ import annotations

from fastapi.testclient import TestClient

from app.testsupport.auth import auth_headers, login_user, register_user


def test_jobs_from_link_requires_authentication(client: TestClient) -> None:
    response = client.post(
        "/jobs/from-link",
        json={"url": "https://example.com/jobs/123"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_jobs_from_link_returns_prefill_data_and_warnings(
    client: TestClient,
    monkeypatch,
) -> None:
    register_user(client, username="lior", email="lior@example.com")
    token = login_user(client, email="lior@example.com")

    def fake_extract_from_link(entity_type: str, url: str, *, raw_text: str | None = None):
        assert entity_type == "job_application"
        assert url == "https://example.com/jobs/123"
        assert raw_text is None
        return type(
            "Result",
            (),
            {
                "data": {
                    "company_name": "Example Inc",
                    "job_title": "Backend Engineer",
                    "location": "Tel Aviv, Israel",
                },
                "warnings": ["Some important fields could not be extracted: required skills."],
            },
        )()

    monkeypatch.setattr("app.routers.job_extraction.extract_from_link", fake_extract_from_link)

    response = client.post(
        "/jobs/from-link",
        headers=auth_headers(token),
        json={"url": "https://example.com/jobs/123"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "data": {
            "company_name": "Example Inc",
            "job_title": "Backend Engineer",
            "location": "Tel Aviv, Israel",
            "full_description": None,
            "required_skills": None,
            "short_description": None,
            "source": None,
            "source_link": None,
            "job_link": None,
            "work_mode": None,
            "salary_range": None,
        },
        "warnings": ["Some important fields could not be extracted: required skills."],
    }


def test_jobs_from_link_returns_fetch_failures_as_bad_gateway(
    client: TestClient,
    monkeypatch,
) -> None:
    from app.services.extraction import FetchError

    register_user(client, username="lior", email="lior@example.com")
    token = login_user(client, email="lior@example.com")

    def fake_extract_from_link(entity_type: str, url: str, *, raw_text: str | None = None):
        raise FetchError("The link could not be accessed. Please check the URL or paste the job description.")

    monkeypatch.setattr("app.routers.job_extraction.extract_from_link", fake_extract_from_link)

    response = client.post(
        "/jobs/from-link",
        headers=auth_headers(token),
        json={"url": "https://example.com/jobs/123"},
    )

    assert response.status_code == 502
    assert response.json() == {
        "detail": "The link could not be accessed. Please check the URL or paste the job description."
    }
