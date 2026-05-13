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
    "application_type",
    [
        "recruiter",
        "direct_from_site",
        "through_connection",
    ],
)
def test_job_application_accepts_canonical_application_types_on_create(
    client: TestClient,
    application_type: str,
) -> None:
    token = register_and_login(client)

    response = client.post(
        "/job-applications/",
        headers=auth_headers(token),
        json={
            "company_name": "Canonical Types Inc",
            "job_title": "Platform Engineer",
            "application_type": application_type,
        },
    )

    assert response.status_code == 200
    assert response.json()["application_type"] == application_type


def test_job_application_accepts_null_application_type_on_create(client: TestClient) -> None:
    token = register_and_login(client)

    response = client.post(
        "/job-applications/",
        headers=auth_headers(token),
        json={
            "company_name": "Optional Field Inc",
            "job_title": "QA Engineer",
            "application_type": "   ",
        },
    )

    assert response.status_code == 200
    assert response.json()["application_type"] is None


@pytest.mark.parametrize(
    "application_type",
    [
        "direct",
        "through connection",
        "linkedin",
        "referral",
    ],
)
def test_job_application_rejects_unsupported_application_types_on_create(
    client: TestClient,
    application_type: str,
) -> None:
    token = register_and_login(client)

    response = client.post(
        "/job-applications/",
        headers=auth_headers(token),
        json={
            "company_name": "Validation Inc",
            "job_title": "Security Engineer",
            "application_type": application_type,
        },
    )

    assert response.status_code == 422
    assert "Application Type must be one of" in response.text


@pytest.mark.parametrize(
    "application_type",
    [
        "recruiter",
        "direct_from_site",
        "through_connection",
    ],
)
def test_job_application_accepts_canonical_application_types_on_update(
    client: TestClient,
    application_type: str,
) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token)

    response = client.put(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(token),
        json={"application_type": application_type},
    )

    assert response.status_code == 200
    assert response.json()["application_type"] == application_type


def test_job_application_rejects_unsupported_application_type_on_update(
    client: TestClient,
) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token)

    response = client.put(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(token),
        json={"application_type": "direct"},
    )

    assert response.status_code == 422
    assert "Application Type must be one of" in response.text
