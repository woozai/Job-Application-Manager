import pytest
from fastapi.testclient import TestClient


def register_and_login(client: TestClient) -> str:
    response = client.post(
        "/users/",
        json={
            "username": "lior",
            "email": "lior@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 200

    login_response = client.post(
        "/users/token",
        data={"username": "lior@example.com", "password": "password123"},
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def create_job_application(client: TestClient, token: str) -> dict:
    response = client.post(
        "/job-applications/",
        headers=auth_headers(token),
        json={
            "company_name": "OpenAI",
            "job_title": "Backend Engineer",
        },
    )
    assert response.status_code == 200
    return response.json()


@pytest.mark.parametrize(
    ("field_name", "unsafe_url"),
    [
        ("job_link", "javascript:alert(1)"),
        ("source_link", "data:text/html,<script>alert(1)</script>"),
        ("job_link", "vbscript:msgbox(1)"),
        ("source_link", "not-a-valid-url"),
    ],
)
def test_job_application_rejects_unsafe_urls(
    client: TestClient,
    field_name: str,
    unsafe_url: str,
) -> None:
    token = register_and_login(client)

    response = client.post(
        "/job-applications/",
        headers=auth_headers(token),
        json={
            "company_name": "Unsafe Links Inc",
            "job_title": "Security Tester",
            field_name: unsafe_url,
        },
    )
    list_response = client.get("/job-applications/", headers=auth_headers(token))

    assert response.status_code == 422
    assert list_response.status_code == 200
    assert list_response.json() == []


def test_job_application_normalizes_empty_url_fields(client: TestClient) -> None:
    token = register_and_login(client)

    response = client.post(
        "/job-applications/",
        headers=auth_headers(token),
        json={
            "company_name": "OpenAI",
            "job_title": "Frontend Engineer",
            "job_link": "   ",
            "source_link": "",
        },
    )

    assert response.status_code == 200
    assert response.json()["job_link"] is None
    assert response.json()["source_link"] is None


@pytest.mark.parametrize(
    "unsafe_url",
    [
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "vbscript:msgbox(1)",
        "not-a-valid-url",
    ],
)
def test_contact_rejects_unsafe_profile_link(
    client: TestClient,
    unsafe_url: str,
) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token)

    response = client.post(
        "/contacts/",
        headers=auth_headers(token),
        json={
            "job_application_id": job_application["id"],
            "name": "Hiring Manager",
            "profile_link": unsafe_url,
        },
    )
    list_response = client.get("/contacts/", headers=auth_headers(token))

    assert response.status_code == 422
    assert list_response.status_code == 200
    assert list_response.json() == []


def test_contact_normalizes_empty_profile_link(client: TestClient) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token)

    response = client.post(
        "/contacts/",
        headers=auth_headers(token),
        json={
            "job_application_id": job_application["id"],
            "name": "Hiring Manager",
            "profile_link": " ",
        },
    )

    assert response.status_code == 200
    assert response.json()["profile_link"] is None


def test_script_like_user_text_is_stored_as_plain_text(client: TestClient) -> None:
    token = register_and_login(client)
    script_like_text = "<script>alert(1)</script>"

    response = client.post(
        "/job-applications/",
        headers=auth_headers(token),
        json={
            "company_name": "OpenAI",
            "job_title": "Security Engineer",
            "notes": script_like_text,
            "full_description": f"Plain text only: {script_like_text}",
        },
    )

    assert response.status_code == 200
    assert response.json()["notes"] == script_like_text
    assert response.json()["full_description"] == f"Plain text only: {script_like_text}"
