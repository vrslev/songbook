from __future__ import annotations

import random
from typing import Any, TypedDict, cast

from fastapi import FastAPI

from backend.app.factory import Settings, get_app, make_state_from_settings
from backend.app.routers.user import add_superuser
from backend.core.song import (
    ChordsSection,
    LyricsSection,
    SongChords,
    SongLinks,
    SongNoKey,
    SongStore,
    SongTempo,
    TimeSignature,
)
from backend.core.user import StoreUserNoKey, UserStore


def get_app_with_mock_data(settings: Settings) -> FastAPI:
    async def add_superuser_():
        return await add_superuser(
            username="super",
            password="super",
            user_store=state.user_store,
            pwd_context=state.pwd_context,
        )

    async def add_mock_data():
        await fill_song_store(state.song_store)
        await fill_user_store(state.user_store)

    state = make_state_from_settings(settings)
    app = get_app(
        state,
        debug=settings.debug,
        sentry_dsn=settings.sentry_dsn,
    )
    app.add_event_handler(  # pyright: ignore[reportUnknownMemberType]
        "startup", add_superuser_
    )
    app.add_event_handler(  # pyright: ignore[reportUnknownMemberType]
        "startup", add_mock_data
    )
    return app


async def fill_user_store(store: UserStore) -> None:
    user = StoreUserNoKey(
        username="lev",
        # Password is "secret"
        hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        is_superuser=False,
    )
    await store.add(user)


async def fill_song_store(store: SongStore) -> None:
    class InputTempo(TypedDict):
        bpm: float
        time_signature: TimeSignature

    class InputSong(TypedDict):
        artist: str | None
        name: str
        tempo: InputTempo

    # fmt: off
    songs: tuple[InputSong, ...] = ({'artist': 'Hillsong Young & Free', 'name': 'Only Wanna Sing', 'tempo': {'bpm': 130.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong Young & Free', 'name': 'Only Wanna Sing (with sample) veryveryvery long name', 'tempo': {'bpm': 130.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong Young & Free', 'name': 'Wake', 'tempo': {'bpm': 131.0, 'time_signature': '4/4'}}, {'artist': 'Cory Asbury', 'name': "The Father's House", 'tempo': {'bpm': 81.0, 'time_signature': '4/4'}}, {'artist': 'Bethel Music', 'name': 'No Longer Slaves', 'tempo': {'bpm': 74.0, 'time_signature': '4/4'}}, {'artist': 'Cory Asbury', 'name': 'Egypt', 'tempo': {'bpm': 75.0, 'time_signature': '4/4'}}, {'artist': 'Mosaic MSC', 'name': 'Tremble', 'tempo': {'bpm': 74.0, 'time_signature': '4/4'}}, {'artist': 'Elevation Worship', 'name': 'Worthy', 'tempo': {'bpm': 67.5, 'time_signature': '4/4'}}, {'artist': 'Hillsong Young & Free', 'name': 'This Is Living (no sample)', 'tempo': {'bpm': 128.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong Young & Free', 'name': 'This Is Living', 'tempo': {'bpm': 128.0, 'time_signature': '4/4'}}, {'artist': 'Слово жизни Music', 'name': 'Ты добрый Бог', 'tempo': {'bpm': 70.0, 'time_signature': '4/4'}}, {'artist': 'Cory Asbury', 'name': 'Reckless Love', 'tempo': {'bpm': 83.0, 'time_signature': '6/8'}}, {'artist': 'Josh Baldwin', 'name': 'Stand In Your Love', 'tempo': {'bpm': 72.5, 'time_signature': '4/4'}}, {'artist': 'Hillsong Young & Free', 'name': 'Lord Send Revival', 'tempo': {'bpm': 74.5, 'time_signature': '6/8'}}, {'artist': 'Elevation Worship', 'name': 'Never Lost', 'tempo': {'bpm': 62.0, 'time_signature': '6/8'}}, {'artist': 'Hillsong Young & Free', 'name': 'Phenomena', 'tempo': {'bpm': 132.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong Young & Free', 'name': 'Phenomena (trap)', 'tempo': {'bpm': 132.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong Young & Free', 'name': 'Phenomena (no sample)', 'tempo': {'bpm': 132.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Для Тебя, мой Господь', 'tempo': {'bpm': 90.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Наш Бог всемогущий', 'tempo': {'bpm': 106.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Буду славить Тебя утром', 'tempo': {'bpm': 130.0, 'time_signature': '4/4'}}, {'artist': 'Phil Wickham', 'name': 'Battle Belongs', 'tempo': {'bpm': 81.0, 'time_signature': '4/4'}}, {'artist': 'Chris Tomlin', 'name': 'How Great Is Our God', 'tempo': {'bpm': 78.0, 'time_signature': '4/4'}}, {'artist': 'Chris Tomlin', 'name': 'Our God', 'tempo': {'bpm': 105.0, 'time_signature': '4/4'}}, {'artist': 'Bethel Music', 'name': 'King of My Heart', 'tempo': {'bpm': 68.0, 'time_signature': '4/4'}}, {'artist': 'Leeland', 'name': 'Way Maker', 'tempo': {'bpm': 68.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Иисус, Ты всё для меня', 'tempo': {'bpm': 130.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Мой Господь, Тебя прославлю', 'tempo': {'bpm': 104.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Воздам Тебе, Господь, всю славу', 'tempo': {'bpm': 92.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong Ukraine', 'name': 'Сильней, чем жизнь', 'tempo': {'bpm': 92.0, 'time_signature': '4/4'}}, {'artist': 'Bethel Music', 'name': 'Raise a Hallelujah', 'tempo': {'bpm': 82.0, 'time_signature': '4/4'}}, {'artist': 'Океан Любви', 'name': 'Сила в крови', 'tempo': {'bpm': 140.0, 'time_signature': '4/4'}}, {'artist': 'Океан Любви', 'name': 'Новое твори', 'tempo': {'bpm': 86.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Яви Свою славу', 'tempo': {'bpm': 68.0, 'time_signature': '4/4'}}, {'artist': 'Matt Redman', 'name': 'Blessed Be Your Name', 'tempo': {'bpm': 125.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Blessed Be Your Name (slow)', 'tempo': {'bpm': 100.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong Worship', 'name': 'Still', 'tempo': {'bpm': 70.0, 'time_signature': '4/4'}}, {'artist': 'Слово жизни Music', 'name': 'Орлы', 'tempo': {'bpm': 73.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong Worship', 'name': 'What a Beautiful Name (with sample)', 'tempo': {'bpm': 68.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong Worship', 'name': 'What a Beautiful Name', 'tempo': {'bpm': 68.0, 'time_signature': '4/4'}}, {'artist': 'Elevation Worship', 'name': 'See A Victory', 'tempo': {'bpm': 77.5, 'time_signature': '4/4'}}, {'artist': 'Слово жизни Music', 'name': 'Песня Иосифа', 'tempo': {'bpm': 78.0, 'time_signature': '4/4'}}, {'artist': 'Слово жизни Music', 'name': 'Песня Павла', 'tempo': {'bpm': 72.5, 'time_signature': '6/8'}}, {'artist': 'Elevation Worship', 'name': 'The Blessing', 'tempo': {'bpm': 70.0, 'time_signature': '4/4'}}, {'artist': 'Jesus Culture', 'name': 'Your Love Never Fails', 'tempo': {'bpm': 114.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong United', 'name': 'Oceans', 'tempo': {'bpm': 66.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong Worship', 'name': 'Cornerstone', 'tempo': {'bpm': 72.5, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Мы будем славить Твоё имя', 'tempo': {'bpm': 110.0, 'time_signature': '4/4'}}, {'artist': 'SokolovBrothers', 'name': 'Поклонюсь Тебе', 'tempo': {'bpm': 68.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Worthy of It All', 'tempo': {'bpm': 71.0, 'time_signature': '4/4'}}, {'artist': 'Bethel Music', 'name': 'Take Courage', 'tempo': {'bpm': 71.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Love Like Fire', 'tempo': {'bpm': 81.0, 'time_signature': '4/4'}}, {'artist': 'Elevation Worship', 'name': 'Praise Goes On', 'tempo': {'bpm': 118.0, 'time_signature': '4/4'}}, {'artist': 'Elevation Worship', 'name': 'Call Upon The Lord', 'tempo': {'bpm': 80.5, 'time_signature': '4/4'}}, {'artist': 'Hillsong Worship', 'name': 'Anchor', 'tempo': {'bpm': 73.0, 'time_signature': '4/4'}}, {'artist': 'Elevation Worship', 'name': 'Do It Again', 'tempo': {'bpm': 86.0, 'time_signature': '4/4'}}, {'artist': 'Jesus Culture', 'name': 'Our God Reigns', 'tempo': {'bpm': 70.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Yeshua', 'tempo': {'bpm': 68.0, 'time_signature': '4/4'}}, {'artist': 'Bethel Music', 'name': 'Ever Be', 'tempo': {'bpm': 69.0, 'time_signature': '4/4'}}, {'artist': 'Слово жизни Music', 'name': 'Твоя сила во мне', 'tempo': {'bpm': 65.0, 'time_signature': '4/4'}}, {'artist': 'Слово жизни Music', 'name': 'Ты нёс меня над водою', 'tempo': {'bpm': 71.0, 'time_signature': '4/4'}}, {'artist': 'Слово жизни Music', 'name': 'Бог живой', 'tempo': {'bpm': 127.0, 'time_signature': '4/4'}}, {'artist': 'Слово жизни Music', 'name': 'Твой мир', 'tempo': {'bpm': 70.0, 'time_signature': '4/4'}}, {'artist': 'Hillsong United', 'name': 'The Stand', 'tempo': {'bpm': 74.0, 'time_signature': '4/4'}}, {'artist': 'Слово жизни Music', 'name': 'Песня Марии Магдалины', 'tempo': {'bpm': 89.0, 'time_signature': '6/8'}}, {'artist': 'Matt Redman', 'name': '10,000 Reasons', 'tempo': {'bpm': 72.5, 'time_signature': '4/4'}}, {'artist': 'Bethel Music', 'name': 'Be Enthroned', 'tempo': {'bpm': 71.0, 'time_signature': '4/4'}}, {'artist': None, 'name': 'Что за милость', 'tempo': {'bpm': 62.0, 'time_signature': '4/4'}})
    # fmt: on

    lyrics: list[LyricsSection] = [
        LyricsSection(
            name="Verse 1",
            text="""You were the Word at the beginning
One with God the Lord Most High
Your hidden glory in creation
Now revealed in You our Christ""",
        ),
        LyricsSection(
            name="Chorus 1",
            text="""What a beautiful Name it is
What a beautiful Name it is
The Name of Jesus Christ my King
What a beautiful Name it is
Nothing compares to this
What a beautiful Name it is
The Name of Jesus""",
        ),
        LyricsSection(
            name="Verse 2",
            text="""You didn’t want heaven without us
So Jesus You brought heaven down
My sin was great Your love was greater
What could separate us now""",
        ),
        LyricsSection(
            name="Chorus 2",
            text="""What a wonderful Name it is
What a wonderful Name it is
The Name of Jesus Christ my King
What a wonderful Name it is
Nothing compares to this
What a wonderful Name it is
The Name of Jesus
What a wonderful Name it is
The Name of Jesus""",
        ),
        LyricsSection(
            name="Bridge",
            text="""Death could not hold You
The veil tore before You
You silence the boast of sin and grave
The heavens are roaring
The praise of Your glory
For You are raised to life again

You have no rival
You have no equal
Now and forever God You reign
Yours is the kingdom
Yours is the glory
Yours is the Name above all names""",
        ),
        LyricsSection(
            name="Chorus 3",
            text="""What a powerful Name it is
What a powerful Name it is
The Name of Jesus Christ my King
What a powerful Name it is
Nothing can stand against
What a powerful Name it is
The Name of Jesus""",
        ),
        LyricsSection(
            name="Tag",
            text="""What a powerful Name it is The Name of Jesus
What a powerful Name it is The Name of Jesus""",
        ),
    ]

    chords = SongChords(
        key="D",
        sections=[
            ChordsSection(
                name="Verse 1",
                notes=cast(Any, "| D G | Bm A |\n| Bm A/C# | D G | Bm A |"),
            ),
            ChordsSection(
                name="Chorus 1",
                notes=cast(Any, "| D A Bm | A G D/F# | A Bm A G |"),
            ),
        ],
    )

    am_url = (
        "https://music.apple.com/ru/album/do-it-again-live/1192789472?i=1192789624&l=en"
    )
    yt_url = "https://www.youtube.com/watch?v=ZOBIPb-6PTc"

    def make_entry(song: InputSong):
        return SongNoKey(
            name=song["name"],
            original_name=cast(Any, random.choice((song["name"], None))),
            artist=cast(Any, song["artist"]),
            links=SongLinks(
                apple_music=random.choice((cast(Any, am_url), None)),
                youtube=random.choice((cast(Any, yt_url), None)),
            ),
            tempo=SongTempo(
                bpm=song["tempo"]["bpm"], time_signature=song["tempo"]["time_signature"]
            ),
            chords=chords,
            lyrics=lyrics,
        )

    for song in songs:
        await store.add(make_entry(song))


app = get_app_with_mock_data(
    Settings(".env")  # pyright: ignore[reportGeneralTypeIssues]
)
