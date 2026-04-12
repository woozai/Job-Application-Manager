from fastapi.testclient import TestClient


def register_user(
    client: TestClient,
    *,
    username: str,
    email: str,
    password: str = "password123",
) -> dict:
    response = client.post(
        "/users/",
        json={
            "username": username,
            "email": email,
            "password": password,
        },
    )
    assert response.status_code == 200
    return response.json()


def login_user(
    client: TestClient, *, email: str, password: str = "password123"
) -> str:
    response = client.post(
        "/users/token",
        data={"username": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_register_and_login_and_read_current_user(client: TestClient) -> None:
    user = register_user(
        client,
        username="lior",
        email="Lior@example.com",
    )

    token = login_user(client, email="lior@example.com")

    me_response = client.get("/users/me", headers=auth_headers(token))

    assert me_response.status_code == 200
    assert me_response.json()["id"] == user["id"]
    assert me_response.json()["email"] == "lior@example.com"


def test_login_returns_refresh_token_and_can_refresh_session(client: TestClient) -> None:
    register_user(client, username="lior", email="lior@example.com")

    login_response = client.post(
        "/users/token",
        data={"username": "lior@example.com", "password": "password123"},
    )
    refresh_token = login_response.json()["refresh_token"]

    refresh_response = client.post(
        "/users/refresh",
        json={"refresh_token": refresh_token},
    )

    assert login_response.status_code == 200
    assert login_response.json()["access_token"]
    assert refresh_token
    assert refresh_response.status_code == 200
    assert refresh_response.json()["access_token"]
    assert refresh_response.json()["refresh_token"]
    assert refresh_response.json()["token_type"] == "bearer"


def test_refresh_token_cannot_access_protected_routes(client: TestClient) -> None:
    register_user(client, username="lior", email="lior@example.com")

    login_response = client.post(
        "/users/token",
        data={"username": "lior@example.com", "password": "password123"},
    )
    refresh_token = login_response.json()["refresh_token"]

    response = client.get("/users/me", headers=auth_headers(refresh_token))

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid or expired token"}


def test_login_rejects_invalid_password(client: TestClient) -> None:
    register_user(client, username="lior", email="lior@example.com")

    response = client.post(
        "/users/token",
        data={"username": "lior@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect email or password"}


def test_job_applications_require_authentication(client: TestClient) -> None:
    response = client.get("/job-applications/")

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_users_only_see_their_own_job_applications(client: TestClient) -> None:
    register_user(client, username="alice", email="alice@example.com")
    register_user(client, username="bob", email="bob@example.com")

    alice_token = login_user(client, email="alice@example.com")
    bob_token = login_user(client, email="bob@example.com")

    create_response = client.post(
        "/job-applications/",
        headers=auth_headers(alice_token),
        json={
            "company_name": "OpenAI",
            "job_title": "Backend Engineer",
            "status": "applied",
        },
    )
    job_id = create_response.json()["id"]

    alice_jobs_response = client.get(
        "/job-applications/",
        headers=auth_headers(alice_token),
    )
    bob_jobs_response = client.get(
        "/job-applications/",
        headers=auth_headers(bob_token),
    )
    bob_read_alice_job_response = client.get(
        f"/job-applications/{job_id}",
        headers=auth_headers(bob_token),
    )

    assert create_response.status_code == 200
    assert len(alice_jobs_response.json()) == 1
    assert bob_jobs_response.status_code == 200
    assert bob_jobs_response.json() == []
    assert bob_read_alice_job_response.status_code == 404


def test_users_cannot_add_contacts_to_other_users_jobs(client: TestClient) -> None:
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
    job_id = job_response.json()["id"]

    response = client.post(
        "/contacts/",
        headers=auth_headers(bob_token),
        json={
            "job_application_id": job_id,
            "name": "Hiring Manager",
        },
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Job application not found"}
