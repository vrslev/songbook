from __future__ import annotations

from pydantic import BaseModel

from backend.core.store import Store


class User(BaseModel):
    is_superuser: bool
    username: str


class StoreUserNoKey(User):
    hashed_password: str


class StoreUser(StoreUserNoKey):
    key: str


UserStore = Store[StoreUser, StoreUserNoKey]


def get_user_with_updated_password(
    user: StoreUser, new_hashed_password: str
) -> StoreUserNoKey:
    return StoreUserNoKey(
        is_superuser=user.is_superuser,
        username=user.username,
        hashed_password=new_hashed_password,
    )
