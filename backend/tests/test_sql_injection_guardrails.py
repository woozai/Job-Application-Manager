from fastapi.testclient import TestClient


SQL_LIKE_PAYLOAD = "' OR 1=1 --"


def register_user(
    client: TestClient,
    *,
    username: str,
    email: str,
) -> dict:
    response = client.post(
        "/users/",
        json={
            "username": username,
            "email": email,
            "password": "password123",
        },
    )
    assert response.status_code == 200
    return response.json()


def login_user(client: TestClient, *, email: str) -> str:
    response = client.post(
        "/users/token",
        data={"username": email, "password": "password123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_sql_like_job_payload_does_not_break_user_isolation(client: TestClient) -> None:
    register_user(client, username="alice", email="alice@example.com")
    register_user(client, username="bob", email="bob@example.com")
    alice_token = login_user(client, email="alice@example.com")
    bob_token = login_user(client, email="bob@example.com")

    create_response = client.post(
        "/job-applications/",
        headers=auth_headers(alice_token),
        json={
            "company_name": SQL_LIKE_PAYLOAD,
            "job_title": "Backend Engineer",
            "notes": SQL_LIKE_PAYLOAD,
        },
    )
    alice_jobs_response = client.get("/job-applications/", headers=auth_headers(alice_token))
    bob_jobs_response = client.get("/job-applications/", headers=auth_headers(bob_token))

    assert create_response.status_code == 200
    assert create_response.json()["company_name"] == SQL_LIKE_PAYLOAD
    assert alice_jobs_response.status_code == 200
    assert len(alice_jobs_response.json()) == 1
    assert bob_jobs_response.status_code == 200
    assert bob_jobs_response.json() == []


def test_sql_like_contact_payload_does_not_break_user_isolation(client: TestClient) -> None:
    register_user(client, username="alice", email="alice@example.com")
    register_user(client, username="bob", email="bob@example.com")
    alice_token = login_user(client, email="alice@example.com")
    bob_token = login_user(client, email="bob@example.com")

    job_response = client.post(
        "/job-applications/",
        headers=auth_headers(alice_token),
        json={
            "company_name": "OpenAI",
            "job_title": "Platform Engineer",
        },
    )
    assert job_response.status_code == 200

    create_response = client.post(
        "/contacts/",
        headers=auth_headers(alice_token),
        json={
            "job_application_id": job_response.json()["id"],
            "name": SQL_LIKE_PAYLOAD,
            "notes": SQL_LIKE_PAYLOAD,
        },
    )
    alice_contacts_response = client.get("/contacts/", headers=auth_headers(alice_token))
    bob_contacts_response = client.get("/contacts/", headers=auth_headers(bob_token))

    assert create_response.status_code == 200
    assert create_response.json()["name"] == SQL_LIKE_PAYLOAD
    assert alice_contacts_response.status_code == 200
    assert len(alice_contacts_response.json()) == 1
    assert bob_contacts_response.status_code == 200
    assert bob_contacts_response.json() == []
