from dataclasses import dataclass
from typing import Callable, TypeVar

from fastapi import Depends, HTTPException, Request
from fastapi.security.oauth2 import OAuth2PasswordBearer

from backend.core.auth import PwdContext, TokenContext
from backend.core.song import SongStore
from backend.core.user import User, UserStore

__all__ = [
    "get_pwd_context",
    "get_token_context",
    "get_user_store",
    "get_song_store",
    "get_current_user",
    "get_current_superuser",
    "CustomState",
]


@dataclass
class CustomState:
    pwd_context: PwdContext
    token_context: TokenContext
    user_store: UserStore
    song_store: SongStore


T = TypeVar("T")


def dependency_getter(dependency_name: str, type: type[T]) -> Callable[..., T]:
    def inner(request: Request):
        return getattr(request.app.state.custom_state, dependency_name)

    return inner


get_pwd_context = dependency_getter("pwd_context", PwdContext)
get_token_context = dependency_getter("token_context", TokenContext)
get_user_store = dependency_getter("user_store", UserStore)
get_song_store = dependency_getter("song_store", SongStore)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_store: UserStore = Depends(get_user_store),
    token_context: TokenContext = Depends(get_token_context),
) -> User:
    if username := token_context.decode(token):
        if user := await user_store.query_one({"username": username}):
            return User.parse_obj(user)

    raise HTTPException(401, "Could not validate credentials")


def get_current_superuser(user: User = Depends(get_current_user)) -> User:
    if user.is_superuser:
        return user

    raise HTTPException(403, "Not a superuser")
