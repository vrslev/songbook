from __future__ import annotations

from collections.abc import Iterable
from typing import Final, Optional

from pydantic import BaseModel, PydanticValueError
from typing_extensions import Self

NOTES_TO_INDEXES: Final = {
    "C": 0,
    "C#": 1,
    "Db": 1,
    "D": 2,
    "D#": 3,
    "Eb": 3,
    "E": 4,
    "F": 5,
    "F#": 6,
    "Gb": 6,
    "G": 7,
    "G#": 8,
    "Ab": 8,
    "A": 9,
    "A#": 10,
    "Bb": 10,
    "B": 11,
}

NORMALIZED_NOTES: Final = (
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
)

ACCIDENTALS: Final = ("#", "b")


class Note(BaseModel):
    note: str
    rest: str
    index: int
    bass_note: Optional[Note] = None

    def __str__(self) -> str:
        if self.bass_note:
            return f"{self.note}{self.rest}/{str(self.bass_note)}"
        return f"{self.note}{self.rest}"

    @classmethod
    def parse(cls, value: str) -> Self:
        # "Bm" or " "
        val = value.strip().lower()
        assert val, ("Value expected", value)

        pure_note = val[0].upper()

        if len(val) > 1 and val[1] in ACCIDENTALS:  # has accidental
            accidental = val[1]
            raw_rest = val[2:]
        else:
            accidental = ""
            raw_rest = val[1:]

        building_bass_note = False
        bass_note_val = ""
        rest = ""

        for symbol in raw_rest:
            if building_bass_note:
                bass_note_val += symbol

            else:
                assert symbol not in ACCIDENTALS, ("Only one accidental allowed", value)

                if symbol == "/":  # bass note starts, for example, C# in A/C#
                    building_bass_note = True
                else:
                    rest += symbol

        assert "/" not in bass_note_val, ("Only one bass note allowed", value)
        bass_note = Note.parse(bass_note_val) if bass_note_val else None

        note = pure_note + accidental
        index = NOTES_TO_INDEXES.get(note)
        assert index is not None, ("Invalid note", value)

        return Note(note=note, rest=rest.strip(), index=index, bass_note=bass_note)


class Bar(BaseModel):
    notes: list[Note]

    def __str__(self) -> str:
        return " ".join(str(note) for note in self.notes)

    @classmethod
    def parse(cls, value: str) -> Self:
        # "Bm A" or " "
        val = value.strip()
        assert val, ("Value expected", value)
        return cls(notes=[Note.parse(note) for note in val.split()])


class BarLine(BaseModel):
    bars: list[Bar]

    def __str__(self) -> str:
        joined_bars = " | ".join(str(bar) for bar in self.bars)
        return f"| {joined_bars} |"

    @classmethod
    def parse(cls, value: str) -> Self | None:
        # "| G/C | Bm A |" or " "
        if not (val := value.strip()):
            return
        assert val.startswith("|"), ("Line should start with |", value)
        assert val.endswith("|"), ("Line should end with |", value)
        raw_bars = val[1:-1].strip().split("|")
        return cls(bars=[Bar.parse(bar) for bar in raw_bars])


class NoteSequenceValidationError(PydanticValueError):
    msg_template = '{message}: "{value}"'


def parse_note_sequence(value: str) -> list[BarLine]:
    def parse_bar_line(bar_line: str) -> BarLine | None:
        try:
            return BarLine.parse(bar_line)
        except AssertionError as exc:
            message, value = exc.args[0]
            assert isinstance(message, str)
            raise NoteSequenceValidationError(message=message, value=value)

    def parse_bar_lines(value: str) -> Iterable[BarLine]:
        for bar_line in value.splitlines():
            if result := parse_bar_line(bar_line):
                yield result

    return list(parse_bar_lines(value))


def stringify_note_sequence(bar_lines: list[BarLine]) -> str:
    return "\n".join(str(bar_line) for bar_line in bar_lines)
