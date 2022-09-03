import pytest
from fastapi.testclient import TestClient

from backend.core.song import Song, SongNoKey, SongStore


async def test_all(auth_client: TestClient, song_store: SongStore, song: SongNoKey):
    added = await song_store.add(song)
    response = auth_client.get("/song/")
    assert response.status_code == 200

    all = [Song(**s) for s in response.json()]
    assert await song_store.get_all() == all
    assert all[0] == added


async def test_add_ok(auth_client: TestClient, song_store: SongStore, song: SongNoKey):
    response = auth_client.post("/song", json=song.dict())
    assert response.status_code == 201

    added = Song(**response.json())
    in_db = await song_store.get(added.key)
    assert in_db
    assert in_db == added
    assert SongNoKey.parse_obj(added) == song


@pytest.mark.parametrize(
    ["change_name", "change_artist"], [[True, False], [False, True], [False, False]]
)
async def test_add_conflict(
    auth_client: TestClient,
    song_store: SongStore,
    song: SongNoKey,
    change_name: bool,
    change_artist: bool,
):
    added = await song_store.add(song)

    to_add = song.copy()
    if change_name:
        to_add.name = "new name"
    if change_artist:
        to_add.artist = "new artist"

    response = auth_client.post("/song", json=song.dict())
    assert response.status_code == 409
    assert (
        response.json()["detail"]
        == "Song with requested name and artist already exists"
    )

    assert await song_store.get(added.key) == added


async def test_update_ok(
    auth_client: TestClient, song_store: SongStore, song: SongNoKey
):
    added = await song_store.add(song)
    to_update = song.copy()
    to_update.name = "new name"

    response = auth_client.patch(f"/song/{added.key}", json=to_update.dict())
    assert response.status_code == 200

    in_db = await song_store.get(added.key)
    assert Song(**response.json()) == in_db
    assert SongNoKey.parse_obj(in_db) == to_update


async def test_update_not_found(auth_client: TestClient, song: SongNoKey):
    response = auth_client.patch("/song/whatever", json=song.dict())
    assert response.status_code == 404
    assert response.json()["detail"] == "Song not found"


async def test_delete(auth_client: TestClient, song_store: SongStore, song: SongNoKey):
    added = await song_store.add(song)

    for response in (
        auth_client.delete(f"/song/{added.key}"),
        auth_client.delete("/song/whatever"),
    ):
        assert response.status_code == 204
        assert response.text == ""
