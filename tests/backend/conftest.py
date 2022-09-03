from dataclasses import dataclass
from datetime import timedelta

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from passlib.context import CryptContext

from backend.app.factory import CustomState, get_app
from backend.app.routers.user import add_superuser
from backend.core.auth import PwdContext, TokenContext
from backend.core.song import Song, SongLinks, SongNoKey, SongStore
from backend.core.store import DictStore
from backend.core.user import StoreUser, StoreUserNoKey, UserStore


@pytest.fixture(autouse=True)
def anyio_backend():
    return "asyncio"


@pytest.fixture
def user_store() -> UserStore:
    return DictStore(model=StoreUser, model_no_key=StoreUserNoKey)


@pytest.fixture
def pwd_context():
    return PwdContext(
        crypt_context=CryptContext(schemes=["bcrypt"], bcrypt__default_rounds=4)
    )


@pytest.fixture
def token_context():
    return TokenContext(
        secret_key="my secret key", expires=timedelta(days=10), algorithm="HS256"
    )


@pytest.fixture
def song_store() -> SongStore:
    return DictStore(model=Song, model_no_key=SongNoKey)


@pytest.fixture
def state(
    user_store: UserStore,
    pwd_context: PwdContext,
    token_context: TokenContext,
    song_store: SongStore,
):
    return CustomState(
        user_store=user_store,
        pwd_context=pwd_context,
        token_context=token_context,
        song_store=song_store,
    )


@pytest.fixture
async def app(state: CustomState, superuser: StoreUserNoKey):
    await add_superuser(
        username=superuser.username,
        password="super",
        user_store=state.user_store,
        pwd_context=state.pwd_context,
    )
    return get_app(state=state, debug=True, sentry_dsn=None)


@pytest.fixture
def client(app: FastAPI):
    with TestClient(app=app) as client:
        yield client


@pytest.fixture
def user():
    hash = "$2b$12$QVZloYJnnIs6zJLedYz3vek/ii17kwGzFSqmP7VrW/vPlOHBDfhl."
    return StoreUserNoKey(is_superuser=False, username="lev", hashed_password=hash)


@pytest.fixture
def superuser():
    hash = "$2b$12$QVZloYJnnIs6zJLedYz3vek/ii17kwGzFSqmP7VrW/vPlOHBDfhl."
    return StoreUserNoKey(is_superuser=True, username="super", hashed_password=hash)


@dataclass
class UserInDbResult:
    token: str


@pytest.fixture
async def user_in_db(
    user_store: UserStore, token_context: TokenContext, user: StoreUserNoKey
) -> UserInDbResult:
    await user_store.add(user)
    token = token_context.create(user.username)
    return UserInDbResult(token=token)


@pytest.fixture
async def auth_client(client: TestClient, user_in_db: UserInDbResult):
    client.headers["Authorization"] = f"bearer {user_in_db.token}"
    return client


@pytest.fixture
async def superauth_client(
    client: TestClient, token_context: TokenContext, superuser: StoreUserNoKey
):
    client.headers[
        "Authorization"
    ] = f"bearer {token_context.create(superuser.username)}"
    return client


@pytest.fixture
def song() -> SongNoKey:
    return SongNoKey(
        name="Reckless Love",
        artist="Cory Asbury",
        links=SongLinks(apple_music=None, youtube=None),
    )
