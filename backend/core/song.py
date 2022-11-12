from __future__ import annotations

from typing import TYPE_CHECKING, Any, Literal, Optional

import chord_chart
from pydantic import BaseModel, HttpUrl, PydanticValueError, UrlHostError, validator
from pydantic.validators import str_validator

from backend.core.store import Store

if TYPE_CHECKING:
    from pydantic.networks import Parts


def blank_string_to_none_validator(v: Any) -> Any:
    if v == "":
        return None
    return v


class StrictHostUrl(HttpUrl):
    allowed_schemes = {"https"}
    allowed_hosts: set[str] = set()

    @classmethod
    def validate_host(cls, parts: Parts) -> tuple[str, str | None, str, bool]:
        host, tld, host_type, rebuild = super().validate_host(parts)
        if host not in cls.allowed_hosts:
            raise UrlHostError
        return host, tld, host_type, rebuild


class AppleMusicUrl(StrictHostUrl):
    allowed_hosts = {"music.apple.com"}


class YoutubeUrl(StrictHostUrl):
    allowed_hosts = {"youtube.com", "www.youtube.com"}


class SongLinks(BaseModel):
    apple_music: Optional[AppleMusicUrl] = None
    youtube: Optional[YoutubeUrl] = None

    @validator("*", pre=True)
    def _(cls, v: Any):
        return blank_string_to_none_validator(v)


TimeSignature = Literal["3/4", "4/4", "6/4", "6/8", "8/8"]
Key = Literal["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
SectionName = Literal[
    "Acapella",
    "Breakdown",
    "Bridge",
    "Bridge 1",
    "Bridge 2",
    "Bridge 3",
    "Bridge 4",
    "Chorus",
    "Chorus 1",
    "Chorus 2",
    "Chorus 3",
    "Chorus 4",
    "Ending",
    "Exhortation",
    "Instrumental",
    "Interlude",
    "Intro",
    "Outro",
    "Post Chorus",
    "Pre Chorus",
    "Pre Chorus 1",
    "Pre Chorus 2",
    "Pre Chorus 3",
    "Pre Chorus 4",
    "Rap",
    "Refrain",
    "Solo",
    "Tag",
    "Turnaround",
    "Vamp",
    "Verse",
    "Verse 1",
    "Verse 2",
    "Verse 3",
    "Verse 4",
    "Verse 5",
    "Verse 6",
]


class SongTempo(BaseModel):
    bpm: float
    time_signature: TimeSignature


class NoteSequenceValidationError(PydanticValueError):
    msg_template = "{message}"


class NoteSequence(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.parse

    @classmethod
    def parse(cls, value: Any):
        value = str_validator(value)
        try:
            return chord_chart.validate_chart(value)
        except chord_chart.ValidationError as exc:
            raise NoteSequenceValidationError(message=exc.args[0])


class ChordsSection(BaseModel):
    name: SectionName
    notes: NoteSequence


class SongChords(BaseModel):
    key: Key
    sections: list[ChordsSection]


class LyricsSection(BaseModel):
    name: SectionName
    text: str


class SongNoKey(BaseModel):
    name: str
    original_name: Optional[str] = None
    artist: Optional[str] = None
    links: SongLinks
    tempo: Optional[SongTempo] = None
    chords: Optional[SongChords] = None
    lyrics: list[LyricsSection] = []

    @validator("*", pre=True)
    def _(cls, v: Any):
        return blank_string_to_none_validator(v)


class Song(SongNoKey):
    key: str


SongStore = Store[Song, SongNoKey]
