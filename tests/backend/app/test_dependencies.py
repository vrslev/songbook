from collections.abc import Awaitable
from functools import partial
from typing import Callable

import pytest
from fastapi import HTTPException

from backend.app.dependencies import get_current_superuser, get_current_user
from backend.core.auth import TokenContext
from backend.core.user import StoreUserNoKey, User, UserStore
from tests.backend.conftest import UserInDbResult


class TestGetCurrentUser:
    Func = Callable[[str], Awaitable[User]]

    @pytest.fixture
    def f(self, user_store: UserStore, token_context: TokenContext) -> Func:
        return partial(
            get_current_user, user_store=user_store, token_context=token_context
        )

    async def test_wrong_token(self, f: Func):
        with pytest.raises(HTTPException) as exc:
            await f("whatever")
        assert exc.value.status_code == 401

    async def test_no_user(self, f: Func, token_context: TokenContext):
        token = token_context.create("lev")
        with pytest.raises(HTTPException) as exc:
            await f(token)
        assert exc.value.status_code == 401

    async def test_ok(self, f: Func, user_in_db: UserInDbResult, user: StoreUserNoKey):
        assert await f(user_in_db.token) == User.parse_obj(user)


class TestGetCurrentSuperuser:
    async def test_user(self, user: StoreUserNoKey):
        with pytest.raises(HTTPException) as exc:
            get_current_superuser(user)
        assert exc.value.status_code == 403

    async def test_superuser(self, superuser: StoreUserNoKey):
        assert get_current_superuser(superuser) is superuser
