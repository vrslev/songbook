from __future__ import annotations

from datetime import timedelta

import pytest
from jose import jwt

from backend.core.auth import PwdContext, TokenContext


class TestPasswordContext:
    def test_password_integration(self, pwd_context: PwdContext):
        password = "secret"
        hash = pwd_context.hash(password=password)
        assert pwd_context.verify(hash, password)

    def test_true(self, pwd_context: PwdContext):
        password = "secret"
        hash: str = pwd_context.crypt_context.hash(password)  # pyright: ignore
        assert pwd_context.verify(hash=hash, password=password)

    def test_false(self, pwd_context: PwdContext):
        hash: str = pwd_context.crypt_context.hash("whatever")  # pyright: ignore
        assert not pwd_context.verify(hash, "secret")

    def test_unknown_hash(self, pwd_context: PwdContext):
        assert not pwd_context.verify("whatever", "secret")


@pytest.fixture
def token_context():
    return TokenContext(
        secret_key="my secret key", expires=timedelta(days=10), algorithm="HS256"
    )


class TestTokenContext:
    def test_integration(self, token_context: TokenContext):
        username = "lev"
        token = token_context.create(username)
        assert token_context.decode(token) == username

    def test_invalid_secret_key(self, token_context: TokenContext):
        token = token_context.create("lev")
        token_context.secret_key = "another key"
        assert token_context.decode(token) is None

    def test_invalid_algorithm(self, token_context: TokenContext):
        token = token_context.create("lev")
        token_context.algorithm = "HS384"
        assert token_context.decode(token) is None

    def test_expired(self, token_context: TokenContext):
        token_context.expires = timedelta(days=-1)
        token = token_context.create("lev")
        assert token_context.decode(token) is None

    def test_invalid_payload(self, token_context: TokenContext):
        token: str = jwt.encode(  # pyright: ignore
            claims={"whatever": "lev"},
            key=token_context.secret_key,
            algorithm=token_context.algorithm,
        )
        assert token_context.decode(token) is None
