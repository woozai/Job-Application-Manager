from fastapi.testclient import TestClient


def register_user(
    client: TestClient,
    *,
    username: str = "lior",
    email: str = "lior@example.com",
    password: str = "password123",
):
    return client.post(
        "/users/",
        json={
            "username": username,
            "email": email,
            "password": password,
        },
    )


def login_user(
    client: TestClient,
    *,
    email: str = "lior@example.com",
    password: str = "password123",
) -> str:
    response = client.post(
        "/users/token",
        data={"username": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_security_headers_are_added_to_api_responses(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert (
        response.headers["Content-Security-Policy"]
        == "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
    )


def test_job_application_rejects_control_characters_in_text_fields(
    client: TestClient,
) -> None:
    token = login_user(client) if register_user(client).status_code == 200 else login_user(client)

    response = client.post(
        "/job-applications/",
        headers=auth_headers(token),
        json={
            "company_name": "OpenAI\u0000",
            "job_title": "Security Engineer",
        },
    )

    assert response.status_code == 422


def test_contact_rejects_control_characters_in_notes(client: TestClient) -> None:
    token = login_user(client) if register_user(client).status_code == 200 else login_user(client)
    job_response = client.post(
        "/job-applications/",
        headers=auth_headers(token),
        json={
            "company_name": "OpenAI",
            "job_title": "Backend Engineer",
        },
    )
    assert job_response.status_code == 200

    response = client.post(
        "/contacts/",
        headers=auth_headers(token),
        json={
            "job_application_id": job_response.json()["id"],
            "name": "Hiring Manager",
            "notes": "hello\u0000world",
        },
    )

    assert response.status_code == 422


def test_user_identity_fields_are_trimmed_and_email_is_normalized(
    client: TestClient,
) -> None:
    response = register_user(
        client,
        username="  Lior  ",
        email="  LIOR@EXAMPLE.COM  ",
    )

    assert response.status_code == 200
    assert response.json()["username"] == "Lior"
    assert response.json()["email"] == "lior@example.com"
