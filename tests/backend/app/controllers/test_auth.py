import requests
from fastapi.testclient import TestClient

from backend.app.routers.auth import Token
from backend.core.auth import PwdContext
from backend.core.user import StoreUserNoKey, User, UserStore


def send_login_request(client: TestClient, username: str, password: str):
    return client.post(
        "/auth/login",
        data={"grant_type": "password", "username": username, "password": password},
    )


def assert_login_response_401(response: requests.Response):
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_login_no_user(client: TestClient):
    response = send_login_request(client, "lev", "pwd")
    assert_login_response_401(response)


async def test_login_wrong_password(
    client: TestClient, user_store: UserStore, user: StoreUserNoKey
):
    await user_store.add(user)
    response = send_login_request(client, user.username, "wrong_password")
    assert_login_response_401(response)


async def test_login_me_integration(
    client: TestClient,
    user_store: UserStore,
    pwd_context: PwdContext,
    user: StoreUserNoKey,
):
    password = "correct password"
    user.hashed_password = pwd_context.hash(password)
    await user_store.add(user)

    login = send_login_request(client, user.username, password)
    assert login.status_code == 200
    token = Token(**login.json())

    me = client.get(
        "/auth/me",
        headers={"Authorization": f"{token.token_type} {token.access_token}"},
    )
    assert me.status_code == 200
    assert me.json() == User.parse_obj(user)
