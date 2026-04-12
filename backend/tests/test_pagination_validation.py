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
    "path",
    [
        "/job-applications/",
        "/contacts/",
    ],
)
@pytest.mark.parametrize(
    "query",
    [
        "skip=-1",
        "limit=0",
        "limit=101",
    ],
)
def test_list_endpoints_reject_invalid_pagination(
    client: TestClient,
    path: str,
    query: str,
) -> None:
    token = register_and_login(client)

    response = client.get(f"{path}?{query}", headers=auth_headers(token))

    assert response.status_code == 422


@pytest.mark.parametrize(
    "query",
    [
        "skip=-1",
        "limit=0",
        "limit=101",
    ],
)
def test_job_applications_by_user_rejects_invalid_pagination(
    client: TestClient,
    query: str,
) -> None:
    token = register_and_login(client)
    current_user = client.get("/users/me", headers=auth_headers(token)).json()

    response = client.get(
        f"/job-applications/user/{current_user['id']}?{query}",
        headers=auth_headers(token),
    )

    assert response.status_code == 422


@pytest.mark.parametrize(
    "query",
    [
        "skip=-1",
        "limit=0",
        "limit=101",
    ],
)
def test_contacts_by_job_application_rejects_invalid_pagination(
    client: TestClient,
    query: str,
) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token)

    response = client.get(
        f"/contacts/job-application/{job_application['id']}?{query}",
        headers=auth_headers(token),
    )

    assert response.status_code == 422
