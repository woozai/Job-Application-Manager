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


def test_job_application_rejects_unsafe_urls(client: TestClient) -> None:
    token = register_and_login(client)

    response = client.post(
        "/job-applications/",
        headers=auth_headers(token),
        json={
            "company_name": "Unsafe Links Inc",
            "job_title": "Security Tester",
            "job_link": "javascript:alert(1)",
            "source_link": "data:text/html,<script>alert(1)</script>",
        },
    )

    assert response.status_code == 422


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


def test_contact_rejects_unsafe_profile_link(client: TestClient) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token)

    response = client.post(
        "/contacts/",
        headers=auth_headers(token),
        json={
            "job_application_id": job_application["id"],
            "name": "Hiring Manager",
            "profile_link": "vbscript:msgbox(1)",
        },
    )

    assert response.status_code == 422


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
