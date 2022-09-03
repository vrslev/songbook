from typing import Any, cast

import pytest
from fastapi.testclient import TestClient

from backend.app.routers.user import UserAdd, UserUpdatePasswordBody, add_user
from backend.core.auth import PwdContext
from backend.core.user import StoreUser, StoreUserNoKey, User, UserStore


async def test_add_user_passes(user_store: UserStore, pwd_context: PwdContext):
    username = "lev"
    password = "secret"
    is_superuser = False

    result = await add_user(
        username=username,
        password=password,
        is_superuser=is_superuser,
        user_store=user_store,
        pwd_context=pwd_context,
    )
    assert result
    assert result is await user_store.query_one({"username": username})
    assert result.username == username
    assert pwd_context.verify(result.hashed_password, password)
    assert result.is_superuser == is_superuser


async def test_add_user_conflict(user_store: UserStore, pwd_context: PwdContext):
    async def query(filters: dict[str, Any]) -> list[StoreUser]:
        return [cast(Any, object())]

    user_store.query = query
    result = await add_user(
        username="",
        password="",
        is_superuser=False,
        user_store=user_store,
        pwd_context=pwd_context,
    )
    assert result is None


async def test_all(superauth_client: TestClient, superuser: StoreUserNoKey):
    response = superauth_client.get("/user/")
    assert response.status_code == 200
    assert response.json() == [User.parse_obj(superuser).dict()]


async def test_add_ok(superauth_client: TestClient, user_store: UserStore):
    username = "john"
    password = "pwd"
    response = superauth_client.post(
        "/user", json=UserAdd(username=username, password=password).dict()
    )
    assert response.status_code == 201

    user = User(**response.json())
    assert not user.is_superuser

    in_db = await user_store.query_one({"username": user.username})
    assert in_db
    assert not in_db.is_superuser


async def test_add_conflict(superauth_client: TestClient, superuser: StoreUserNoKey):
    response = superauth_client.post(
        "/user", json=UserAdd(username=superuser.username, password="pwd").dict()
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "User with requested username already exists"


async def test_update_password_ok(
    superauth_client: TestClient,
    user_store: UserStore,
    pwd_context: PwdContext,
    user: StoreUserNoKey,
):
    await user_store.add(user)
    new_password = "new password"
    response = superauth_client.patch(
        f"/user/{user.username}",
        json=UserUpdatePasswordBody(password=new_password).dict(),
    )
    assert response.status_code == 200
    assert User(**response.json()) == User.parse_obj(user)

    in_db = await user_store.query_one({"username": user.username})
    assert in_db
    assert in_db.hashed_password != user
    assert pwd_context.verify(in_db.hashed_password, new_password)


async def test_update_password_not_found(superauth_client: TestClient):
    response = superauth_client.patch(
        "/user/whatever", json=UserUpdatePasswordBody(password="whatever").dict()
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.parametrize("exists", [True, False])
async def test_delete(
    superauth_client: TestClient,
    user_store: UserStore,
    exists: bool,
    user: StoreUserNoKey,
):
    if exists:
        await user_store.add(user)
    response = superauth_client.delete(f"/user/{user.username}")

    assert response.status_code == 204
    assert response.text == ""
    assert not await user_store.query_one({"username": user.username})
