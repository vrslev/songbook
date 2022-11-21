from __future__ import annotations

from typing import Any, cast

import pytest
from pydantic import BaseModel, ValidationError

from backend.core.song import (
    AppleMusicUrl,
    NoteSequence,
    Song,
    SongLinks,
    YoutubeUrl,
    blank_string_to_none_validator,
)


class AppleMusicModel(BaseModel):
    url: AppleMusicUrl


class YoutubeModel(BaseModel):
    url: YoutubeUrl


class NoteSequenceModel(BaseModel):
    seq: NoteSequence


@pytest.mark.parametrize(
    ["v", "expected"],
    [["", None], [None, None], [" ", " "], ["whatever", "whatever"], [12, 12]],
)
def test_blank_string_to_none_validator(v: Any, expected: Any):
    assert blank_string_to_none_validator(v) == expected


def test_apple_music_url_passes():
    AppleMusicModel(url=cast(Any, "https://music.apple.com/something-something"))


@pytest.mark.parametrize(
    "url",
    [
        "http://music.apple.com",
        "http://example.com",
        "https://example.com",
        "https://notmusic.apple.com",
        "https://music.notapple.com",
    ],
)
def test_apple_music_url_fails(url: Any):
    with pytest.raises(ValidationError):
        AppleMusicModel(url=url)


@pytest.mark.parametrize(
    "url", ["https://youtube.com/something", "https://www.youtube.com/something"]
)
def test_youtube_url_passes(url: Any):
    YoutubeModel(url=url)


@pytest.mark.parametrize(
    "url",
    [
        "https://whaa.youtube.com/something",
        "https://example.com",
        "http://www.youtube.com/something",
        "http://youtube.com/something",
    ],
)
def test_youtube_url_fails(url: Any):
    with pytest.raises(ValidationError):
        YoutubeModel(url=url)


@pytest.mark.parametrize(["v", "expected"], (["", None], [None, None]))
def test_song_links_blank_strings(v: Any, expected: Any):
    values = SongLinks(apple_music=v, youtube=v)
    assert values.apple_music == expected
    assert values.youtube == expected


@pytest.mark.parametrize(
    ["v", "expected"],
    [["| D | B | A# |", "| D | H | A# |"], [" |  D | H | A#|   ", "| D | H | A# |"]],
)
def test_note_sequence_passes(v: Any, expected: str):
    assert NoteSequenceModel(seq=v).seq == expected


def test_note_sequence_fails():
    with pytest.raises(ValidationError):
        NoteSequenceModel(seq=cast(Any, "whatever"))


def test_song_blank_strings():
    song = Song(
        name="Reckless Love",
        original_name="",
        artist="",
        links=SongLinks(),
        key="whatever",
    )
    assert song.original_name is None
    assert song.artist is None
