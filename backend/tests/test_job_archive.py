from fastapi.testclient import TestClient


def register_and_login(
    client: TestClient,
    *,
    username: str = "lior",
    email: str = "lior@example.com",
    password: str = "password123",
) -> str:
    response = client.post(
        "/users/",
        json={
            "username": username,
            "email": email,
            "password": password,
        },
    )
    assert response.status_code == 200

    login_response = client.post(
        "/users/token",
        data={"username": email, "password": password},
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def create_job_application(
    client: TestClient,
    token: str,
    *,
    status: str = "waiting",
) -> dict:
    response = client.post(
        "/job-applications/",
        headers=auth_headers(token),
        json={
            "company_name": "OpenAI",
            "job_title": "Backend Engineer",
            "status": status,
        },
    )
    assert response.status_code == 200
    return response.json()


def create_contact(client: TestClient, token: str, job_application_id: int) -> dict:
    response = client.post(
        "/contacts/",
        headers=auth_headers(token),
        json={
            "job_application_id": job_application_id,
            "name": "Hiring Manager",
            "relationship_type": "recruiter",
        },
    )
    assert response.status_code == 200
    return response.json()


def test_job_can_be_archived_without_changing_status(client: TestClient) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token, status="waiting")

    response = client.put(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(token),
        json={"is_archived": True},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "waiting"
    assert response.json()["is_archived"] is True
    assert response.json()["archived_at"] is not None
    assert response.json()["archive_reason"] is None


def test_job_can_be_restored_without_changing_status(client: TestClient) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token, status="interview scheduled")

    archive_response = client.put(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(token),
        json={"is_archived": True, "archive_reason": "Paused for later"},
    )
    assert archive_response.status_code == 200

    restore_response = client.put(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(token),
        json={"is_archived": False},
    )

    assert restore_response.status_code == 200
    assert restore_response.json()["status"] == "interview scheduled"
    assert restore_response.json()["is_archived"] is False
    assert restore_response.json()["archived_at"] is None
    assert restore_response.json()["archive_reason"] is None


def test_archive_fields_are_returned_in_job_application_responses(
    client: TestClient,
) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token, status="saved")

    archive_response = client.put(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(token),
        json={"is_archived": True, "archive_reason": "  Keep for future follow-up  "},
    )
    assert archive_response.status_code == 200

    detail_response = client.get(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(token),
    )
    list_response = client.get("/job-applications/", headers=auth_headers(token))

    assert detail_response.status_code == 200
    assert detail_response.json()["is_archived"] is True
    assert detail_response.json()["archived_at"] is not None
    assert detail_response.json()["archive_reason"] == "Keep for future follow-up"

    assert list_response.status_code == 200
    assert list_response.json()[0]["is_archived"] is True
    assert list_response.json()[0]["archived_at"] is not None
    assert list_response.json()[0]["archive_reason"] == "Keep for future follow-up"


def test_contacts_remain_attached_after_archive_and_restore(
    client: TestClient,
) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token, status="applied")
    contact = create_contact(client, token, job_application["id"])

    archive_response = client.put(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(token),
        json={"is_archived": True},
    )
    assert archive_response.status_code == 200
    assert len(archive_response.json()["contacts"]) == 1
    assert archive_response.json()["contacts"][0]["id"] == contact["id"]

    restore_response = client.put(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(token),
        json={"is_archived": False},
    )
    detail_response = client.get(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(token),
    )
    contacts_response = client.get(
        f"/contacts/job-application/{job_application['id']}",
        headers=auth_headers(token),
    )

    assert restore_response.status_code == 200
    assert len(restore_response.json()["contacts"]) == 1
    assert restore_response.json()["contacts"][0]["id"] == contact["id"]

    assert detail_response.status_code == 200
    assert len(detail_response.json()["contacts"]) == 1
    assert detail_response.json()["contacts"][0]["name"] == "Hiring Manager"

    assert contacts_response.status_code == 200
    assert len(contacts_response.json()) == 1
    assert contacts_response.json()[0]["id"] == contact["id"]


def test_users_cannot_archive_or_restore_jobs_they_do_not_own(
    client: TestClient,
) -> None:
    alice_token = register_and_login(
        client,
        username="alice",
        email="alice@example.com",
    )
    bob_token = register_and_login(
        client,
        username="bob",
        email="bob@example.com",
    )
    job_application = create_job_application(client, alice_token, status="waiting")

    archive_response = client.put(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(bob_token),
        json={"is_archived": True},
    )
    restore_response = client.put(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(bob_token),
        json={"is_archived": False},
    )
    owner_detail_response = client.get(
        f"/job-applications/{job_application['id']}",
        headers=auth_headers(alice_token),
    )

    assert archive_response.status_code == 404
    assert archive_response.json() == {"detail": "Job application not found"}
    assert restore_response.status_code == 404
    assert restore_response.json() == {"detail": "Job application not found"}
    assert owner_detail_response.status_code == 200
    assert owner_detail_response.json()["is_archived"] is False
    assert owner_detail_response.json()["status"] == "waiting"


def test_archive_and_restore_return_404_for_missing_job_ids(
    client: TestClient,
) -> None:
    token = register_and_login(client)

    archive_response = client.put(
        "/job-applications/999999",
        headers=auth_headers(token),
        json={"is_archived": True},
    )
    restore_response = client.put(
        "/job-applications/999999",
        headers=auth_headers(token),
        json={"is_archived": False},
    )

    assert archive_response.status_code == 404
    assert archive_response.json() == {"detail": "Job application not found"}
    assert restore_response.status_code == 404
    assert restore_response.json() == {"detail": "Job application not found"}


def test_archive_and_restore_require_authentication(client: TestClient) -> None:
    token = register_and_login(client)
    job_application = create_job_application(client, token, status="saved")

    archive_response = client.put(
        f"/job-applications/{job_application['id']}",
        json={"is_archived": True},
    )
    restore_response = client.put(
        f"/job-applications/{job_application['id']}",
        json={"is_archived": False},
    )

    assert archive_response.status_code == 401
    assert archive_response.json() == {"detail": "Not authenticated"}
    assert restore_response.status_code == 401
    assert restore_response.json() == {"detail": "Not authenticated"}
