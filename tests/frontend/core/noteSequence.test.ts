import type { ChordsSection, Song, SongChords } from "@/client";
import {
  getHalfSteps,
  NoteSequenceErrMsg,
  NoteSequenceValidationError,
  NOTES_TO_INDEXES,
  parseBar,
  parseBarLine,
  parseNote,
  parseNoteSequence,
  stringifyBar,
  stringifyBarLine,
  stringifyNote,
  stringifyNoteSequence,
  transposeNote,
  transposeSong,
  type Bar,
  type BarLine,
  type Note,
} from "@/core/noteSequence";

describe("Note", () => {
  it.each([
    ["C", { note: "C", rest: "", index: 0 }],
    ["G#m", { note: "G#", rest: "m", index: 8 }],
    ["Dm9", { note: "D", rest: "m9", index: 2 }],
    ["Dbmaj3", { note: "Db", rest: "maj3", index: 1 }],
    ["AB", { note: "Ab", rest: "", index: 8 }],
    ["Bb", { note: "Bb", rest: "", index: 10 }],
    [
      "Abm/C#maj7",
      {
        note: "Ab",
        rest: "m",
        index: 8,
        bassNote: { note: "C#", rest: "maj7", index: 1 },
      },
    ],
    ["A", { note: "A", rest: "", index: 9, bassNote: undefined }],
    [
      "A/C",
      {
        note: "A",
        rest: "",
        index: 9,
        bassNote: { note: "C", rest: "", index: 0 },
      },
    ],
  ] as [string, Note][])("passes", (value, expected) => {
    expect(parseNote(value)).toEqual(expected);
  });

  describe.each(["maj7", "m", ""])("passes on all notes", (rest) => {
    it.each(Object.keys(NOTES_TO_INDEXES))("", (note) => {
      const combined = note + rest;
      const result = parseNote(combined);

      expect(result.note).toBe(note);
      expect(result.rest).toBe(rest);
      expect(result.index).toBe(NOTES_TO_INDEXES[note]);
      expect(stringifyNote(result)).toBe(combined);
    });
  });

  test.each(["", " ", "   "])("value expected", (value) => {
    expect(() => parseNote(value)).toThrow(NoteSequenceErrMsg.NO_VALUE);
  });

  test.each(["C##", "C#b", "B#B", "Bbb"])("multiple accidentals", (value) => {
    expect(() => parseNote(value)).toThrow(
      NoteSequenceErrMsg.MULTIPLE_ACCIDENTALS
    );
  });

  test.each([".#m", "Tb", "!", "H"])("invalid note", (value) => {
    expect(() => parseNote(value)).toThrow(NoteSequenceErrMsg.INVALID_NOTE);
  });
});

describe("Bar", () => {
  it.each([
    ["Abm/C#maj7", "Abm/C#maj7", { notes: [parseNote("Abm/C#maj7")] }],
    [" A ", "A", { notes: [parseNote("A")] }],
    [
      " G/C Bm  A ",
      "G/C Bm A",
      { notes: [parseNote("G/C"), parseNote("Bm"), parseNote("A")] },
    ],
  ])("passes", (v: string, expStr: string, expBar: Bar) => {
    const bar = parseBar(v);
    expect(bar).toStrictEqual(expBar);
    expect(stringifyBar(bar)).toEqual(expStr);
  });

  test("value expected", () => {
    expect(() => parseBar("  ")).toThrow(NoteSequenceErrMsg.NO_VALUE);
  });
});

describe("BarLine", () => {
  it.each([
    [
      "| G/C | Bm  A |",
      "| G/C | Bm A |",
      {
        bars: [
          { notes: [parseNote("G/C")] },
          { notes: [parseNote("Bm"), parseNote("A")] },
        ],
      },
    ],
    ["| G/C |", "| G/C |", { bars: [{ notes: [parseNote("G/C")] }] }],
    [" | G/C | ", "| G/C |", { bars: [{ notes: [parseNote("G/C")] }] }],
  ])("passes", (v: string, expStr: string, expBarLine: BarLine) => {
    const barLine = parseBarLine(v);
    assert(barLine);
    expect(barLine).toStrictEqual(expBarLine);
    expect(stringifyBarLine(barLine)).toEqual(expStr);
  });

  test("undefined", () => {
    expect(parseBarLine("  ")).toBeUndefined();
  });

  test("should start", () => {
    expect(() => parseBarLine(" G")).toThrow(
      NoteSequenceErrMsg.SHOULD_START_WITH
    );
  });

  test("should end", () => {
    expect(() => parseBarLine("| G")).toThrow(
      NoteSequenceErrMsg.SHOULD_END_WITH
    );
  });

  test.each(["||", "|  |", "|||", "|  | |"])("no bars", (v: string) => {
    expect(() => parseBarLine(v)).toThrow(NoteSequenceErrMsg.NO_VALUE);
  });
});

describe("NoteSequence", () => {
  const noteSequence = `\

  | G/C | Bm | A |
  | D |
  | A |

  | Bm | A | G |
          `;
  const cleanNoteSequence = `\
| G/C | Bm | A |
| D |
| A |
| Bm | A | G |`;

  it("passes", () => {
    const notes = parseNoteSequence(noteSequence);
    const parsedLines = [
      "| G/C | Bm | A |",
      "| D |",
      "| A |",
      "| Bm | A | G |",
    ];
    const expectedLines = parsedLines.map(parseBarLine);
    expect(notes).toStrictEqual(expectedLines);
  });

  it("fails", () => {
    expect(() => parseNoteSequence("| G | Bm | Am |\n| Whaaa |")).toThrowError(
      new NoteSequenceValidationError(NoteSequenceErrMsg.INVALID_NOTE, "Whaaa")
    );
  });

  test("stringify", () => {
    const notes = parseNoteSequence(noteSequence);
    expect(stringifyNoteSequence(notes)).toEqual(cleanNoteSequence);
  });
});

test.each([
  [{ note: "C#", rest: "m", index: 1 }, 2, { note: "D#", rest: "m", index: 3 }],
  [
    {
      note: "C#",
      rest: "m",
      index: 1,
      bassNote: { note: "D", rest: "maj3", index: 2 },
    },
    5,
    {
      note: "F#",
      rest: "m",
      index: 6,
      bassNote: { note: "G", rest: "maj3", index: 7 },
    },
  ],
  [
    {
      note: "C#",
      rest: "m",
      index: 1,
      bassNote: { note: "D", rest: "maj3", index: 2 },
    },
    -1,
    {
      note: "C",
      rest: "m",
      index: 0,
      bassNote: { note: "C#", rest: "maj3", index: 1 },
    },
  ],
  [
    {
      note: "C#",
      rest: "m",
      index: 1,
      bassNote: { note: "D", rest: "maj3", index: 2 },
    },
    13,
    {
      note: "D",
      rest: "m",
      index: 2,
      bassNote: { note: "D#", rest: "maj3", index: 3 },
    },
  ],
] as [Note, number, Note][])("transposeNote", (note, halfSteps, expected) => {
  expect(transposeNote(note, halfSteps)).toEqual(expected);
});

test.each([
  ["C", "C#", 1],
  ["C#", "C", -1],
  ["D", "A", 7],
] as [SongChords.key, SongChords.key, number][])(
  "getHalfSteps",
  (key, targetKey, expected) => {
    expect(getHalfSteps(key, targetKey)).toBe(expected);
  }
);

describe("transposeSong", () => {
  it.each([
    [undefined, undefined],
    [undefined, "C"],
    [{ name: "whatever", chords: { key: "C#", sections: [] } }, undefined],
    [{ name: "whatever" }, "C"],
  ] as [Song?, SongChords.key?][])("returns undefined", (song, targetKey) => {
    expect(transposeSong(song, targetKey)).toBe(undefined);
  });

  it("passes", () => {
    const key = "C" as SongChords.key;
    const targetKey = "C#" as SongChords.key;
    const sections: ChordsSection[] = [
      {
        name: "Acapella" as ChordsSection.name,
        notes: ["| G/C Bm | A |", "| D |"].join("\n"),
      },
      { name: "Chorus 1" as ChordsSection.name, notes: "| Bm A G |" },
    ];
    const expected: ChordsSection[] = [
      {
        name: "Acapella" as ChordsSection.name,
        notes: ["| G#/C# Cm | A# |", "| D# |"].join("\n"),
      },
      { name: "Chorus 1" as ChordsSection.name, notes: "| Cm A# G# |" },
    ];
    const song: Song = {
      name: "Whatever",
      links: {},
      key: "",
      chords: { key, sections },
    };

    expect(transposeSong(song, targetKey)).toStrictEqual(expected);
  });
});
