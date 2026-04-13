from datetime import date

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


def test_contact_last_activity_uses_latest_outreach_date(client: TestClient) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token)

    response = client.post(
        "/contacts/",
        headers=auth_headers(token),
        json={
            "job_application_id": job_application["id"],
            "name": "Hiring Manager",
            "connection_requested_at": "2026-04-01",
            "message_sent_at": "2026-04-10",
            "connection_approved_at": "2026-04-05",
        },
    )

    assert response.status_code == 200
    assert response.json()["last_interaction_date"] == "2026-04-10"


def test_contact_last_activity_ignores_client_supplied_date(client: TestClient) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token)

    response = client.post(
        "/contacts/",
        headers=auth_headers(token),
        json={
            "job_application_id": job_application["id"],
            "name": "Hiring Manager",
            "last_interaction_date": "2099-01-01",
        },
    )

    assert response.status_code == 200
    assert response.json()["last_interaction_date"] is None


def test_contact_last_activity_updates_when_outreach_changes(client: TestClient) -> None:
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
            "response_status": "replied",
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["last_interaction_date"] == date.today().isoformat()


def test_contact_last_activity_does_not_update_for_profile_only_edit(
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
            "job_title": "Staff Engineer",
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["last_interaction_date"] is None
