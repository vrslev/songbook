from backend.core.user import StoreUser, get_user_with_updated_password


def test_get_user_with_updated_password():
    is_superuser = True
    username = "lev"
    old_user = StoreUser(
        is_superuser=is_superuser,
        username=username,
        hashed_password="old hash",
        key="1",
    )

    hash = "new hash"
    new_user = get_user_with_updated_password(user=old_user, new_hashed_password=hash)

    assert new_user.is_superuser == is_superuser
    assert new_user.username == username
    assert new_user.hashed_password == hash
