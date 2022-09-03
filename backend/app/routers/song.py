from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.dependencies import get_current_user, get_song_store
from backend.core.song import Song, SongNoKey, SongStore

router = APIRouter(prefix="/song", tags=["song"])


@router.get("/", response_model=list[Song])
async def all(song_store: SongStore = Depends(get_song_store)) -> list[Song]:
    return await song_store.get_all()


@router.post(
    "",
    response_model=Song,
    status_code=201,
    responses={401: {}, 409: {}},
    dependencies=[Depends(get_current_user)],
)
async def add(song: SongNoKey, song_store: SongStore = Depends(get_song_store)) -> Song:
    if await song_store.query({"name": song.name, "artist": song.artist}):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Song with requested name and artist already exists",
        )
    return await song_store.add(song)


@router.patch(
    "/{key}",
    response_model=Song,
    responses={401: {}, 404: {}},
    dependencies=[Depends(get_current_user)],
)
async def update(
    key: str, song: SongNoKey, song_store: SongStore = Depends(get_song_store)
) -> Song:
    if result := await song_store.update(key, song):
        return result
    raise HTTPException(404, "Song not found")


@router.delete(
    "/{key}",
    response_model=None,
    status_code=204,
    responses={401: {}},
    dependencies=[Depends(get_current_user)],
)
async def delete(key: str, song_store: SongStore = Depends(get_song_store)) -> None:
    return await song_store.delete(key)
