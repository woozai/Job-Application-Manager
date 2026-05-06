from __future__ import annotations

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
