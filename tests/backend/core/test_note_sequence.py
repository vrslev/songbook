from textwrap import dedent
from typing import Final

import pytest

from backend.core.note_sequence import (
    NOTES_TO_INDEXES,
    Bar,
    BarLine,
    Note,
    NoteSequenceValidationError,
    parse_note_sequence,
    stringify_note_sequence,
)


@pytest.mark.parametrize(
    ["value", "expected"],
    [
        ("C", Note(note="C", rest="", index=0)),
        ("G#m", Note(note="G#", rest="m", index=8)),
        ("Dm9", Note(note="D", rest="m9", index=2)),
        ("Dbmaj3", Note(note="Db", rest="maj3", index=1)),
        ("AB", Note(note="Ab", rest="", index=8)),
        ("Bb", Note(note="Bb", rest="", index=10)),
        (
            "Abm/C#maj7",
            Note(
                note="Ab",
                rest="m",
                index=8,
                bass_note=Note(note="C#", rest="maj7", index=1),
            ),
        ),
        ("A", Note(note="A", rest="", index=9, bass_note=None)),
        (
            "A/C",
            Note(
                note="A", rest="", index=9, bass_note=Note(note="C", rest="", index=0)
            ),
        ),
    ],
)
def test_note_parse_integration(value: str, expected: Note):
    assert Note.parse(value) == expected


@pytest.mark.parametrize("rest", ["maj7", "m", ""])
@pytest.mark.parametrize("note", NOTES_TO_INDEXES.keys())
def test_note_parse_all_notes_pass(note: str, rest: str):
    combined = note + rest
    result = Note.parse(combined)

    assert result.note == note
    assert result.rest == rest
    assert result.index == NOTES_TO_INDEXES[note]
    assert str(result) == combined


@pytest.mark.parametrize("v", ["", " ", "   "])
def test_note_parse_value_expected(v: str):
    with pytest.raises(AssertionError, match="Value expected"):
        Note.parse(v)


@pytest.mark.parametrize("v", ["C##", "C#b", "B#B", "Bbb"])
def test_note_parse_multiple_accidentals(v: str):
    with pytest.raises(AssertionError, match="Only one accidental allowed"):
        Note.parse(v)


@pytest.mark.parametrize("v", [".#m", "Tb", "!", "H"])
def test_note_parse_invalid_note(v: str):
    with pytest.raises(AssertionError, match="Invalid note"):
        Note.parse(v)


@pytest.mark.parametrize(
    ["v", "exp_str", "exp_bar"],
    [
        ["Abm/C#maj7", "Abm/C#maj7", Bar(notes=[Note.parse("Abm/C#maj7")])],
        [" A ", "A", Bar(notes=[Note.parse("A")])],
        [
            " G/C Bm  A ",
            "G/C Bm A",
            Bar(notes=[Note.parse("G/C"), Note.parse("Bm"), Note.parse("A")]),
        ],
    ],
)
def test_bar_integration(v: str, exp_str: str, exp_bar: Bar):
    assert (bar := Bar.parse(v)) == exp_bar
    assert str(bar) == exp_str


def test_bar_value_expected():
    with pytest.raises(AssertionError, match="Value expected"):
        Bar.parse("  ")


@pytest.mark.parametrize(
    ["v", "exp_str", "exp_bar_line"],
    [
        [
            "| G/C | Bm  A |",
            "| G/C | Bm A |",
            BarLine(
                bars=[
                    Bar(notes=[Note.parse("G/C")]),
                    Bar(notes=[Note.parse("Bm"), Note.parse("A")]),
                ],
            ),
        ],
        [
            "| G/C |",
            "| G/C |",
            BarLine(bars=[Bar(notes=[Note.parse("G/C")])]),
        ],
        [
            " | G/C | ",
            "| G/C |",
            BarLine(bars=[Bar(notes=[Note.parse("G/C")])]),
        ],
    ],
)
def test_bar_line_integration(v: str, exp_str: str, exp_bar_line: BarLine):
    assert (bar_line := BarLine.parse(v)) == exp_bar_line
    assert str(bar_line) == exp_str


def test_bar_line_none():
    assert BarLine.parse(" ") is None


def test_bar_line_should_start():
    with pytest.raises(AssertionError, match="Line should start with |"):
        BarLine.parse(" G")


def test_bar_line_should_end():
    with pytest.raises(AssertionError, match="Line should end with |"):
        BarLine.parse("| G")


@pytest.mark.parametrize(
    "v",
    ["||", "|  |", "|||", "|  | |"],
)
def test_bar_line_no_bars(v: str):
    with pytest.raises(AssertionError, match="Value expected"):
        BarLine.parse(v)


note_sequence: Final = """

    | G/C | Bm | A |
    | D |
    | A |

    | Bm | A | G |
            """

clean_note_sequence: Final = dedent(
    """\
    | G/C | Bm | A |
    | D |
    | A |
    | Bm | A | G |"""
)


def test_parse_note_sequence_passes():
    notes = parse_note_sequence(note_sequence)
    parsed_lines = [
        "| G/C | Bm | A |",
        "| D |",
        "| A |",
        "| Bm | A | G |",
    ]
    expected_lines = [BarLine.parse(bar_line) for bar_line in parsed_lines]
    assert notes == expected_lines


def test_parse_note_sequence_fails():
    with pytest.raises(NoteSequenceValidationError, match='Invalid note: "Whaaa"'):
        parse_note_sequence("| G | Bm | Am |\n| Whaaa |")


def test_stringify_note_sequence():
    notes = parse_note_sequence(note_sequence)
    assert stringify_note_sequence(notes) == clean_note_sequence
