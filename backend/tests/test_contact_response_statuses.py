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
            "job_title": "Frontend Engineer",
        },
    )
    assert response.status_code == 200
    return response.json()


def test_contact_response_statuses_are_served_by_backend(client: TestClient) -> None:
    response = client.get("/contacts/response-statuses")

    assert response.status_code == 200
    assert response.json() == [
        "awaiting response",
        "replied",
        "resume forwarded",
        "no response",
        "declined",
        "referral offered",
    ]


def test_contact_rejects_unknown_response_status_on_create(
    client: TestClient,
) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token)

    response = client.post(
        "/contacts/",
        headers=auth_headers(token),
        json={
            "job_application_id": job_application["id"],
            "name": "Hiring Manager",
            "response_status": "frontend invented status",
        },
    )

    assert response.status_code == 422


def test_contact_rejects_unknown_response_status_on_update(
    client: TestClient,
) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token)
    create_response = client.post(
        "/contacts/",
        headers=auth_headers(token),
        json={
            "job_application_id": job_application["id"],
            "name": "Hiring Manager",
        },
    )
    assert create_response.status_code == 200

    update_response = client.put(
        f"/contacts/{create_response.json()['id']}",
        headers=auth_headers(token),
        json={
            "response_status": "frontend invented status",
        },
    )

    assert update_response.status_code == 422
