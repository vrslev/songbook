import { SongChords, type ChordsSection, type Song } from "@/client";

export interface Note {
  note: string;
  rest: string;
  index: number;
  bassNote?: Note;
}

export const NOTES_TO_INDEXES: { [K: string]: number } = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

export const NORMALIZED_NOTES = Object.values(SongChords.key);
const ACCIDENALS = ["#", "b"];

export enum NoteSequenceErrMsg {
  NO_VALUE = "Ожидалось значение", // "Value expected",
  MULTIPLE_ACCIDENTALS = "Допустим только один знак альтерации", // "Only one accidental allowed",
  MULTPLE_BASS_NOTES = "Допустипа только одна басс-нота", // "Only one bass note allowed",
  INVALID_NOTE = "Несуществующая нота", // "Invalid note",
  SHOULD_START_WITH = "Строка должна начинаться с |", // "Line should start with |",
  SHOULD_END_WITH = "Строка должна заканчиваться на |", // "Line should end with |",
}

export class NoteSequenceValidationError extends Error {
  message: NoteSequenceErrMsg;
  value: string;

  constructor(message: NoteSequenceErrMsg, value: string) {
    super();
    this.message = message;
    this.value = value;
  }
}

function assert(expr: unknown, message: NoteSequenceErrMsg, value: string) {
  if (!expr) throw new NoteSequenceValidationError(message, value);
}

export function parseNote(value: string): Note {
  const val = value.trim().toLowerCase();
  assert(val, NoteSequenceErrMsg.NO_VALUE, value);

  const pureNote = val[0].toUpperCase();
  let accidental;
  let rawRest;

  if (val.length > 1 && ACCIDENALS.includes(val[1])) {
    accidental = val[1];
    rawRest = val.slice(2);
  } else {
    accidental = "";
    rawRest = val.slice(1);
  }

  let buildingBassNote = false;
  let bassNoteVal = "";
  let rest = "";

  for (const symbol of rawRest) {
    if (buildingBassNote) {
      bassNoteVal += symbol;
    } else {
      assert(
        !ACCIDENALS.includes(symbol),
        NoteSequenceErrMsg.MULTIPLE_ACCIDENTALS,
        value
      );

      if (symbol == "/") {
        buildingBassNote = true;
      } else {
        rest += symbol;
      }
    }
  }

  assert(
    !bassNoteVal.includes("/"),
    NoteSequenceErrMsg.MULTPLE_BASS_NOTES,
    value
  );
  const bassNote = bassNoteVal ? parseNote(bassNoteVal) : undefined;

  const note = pureNote + accidental;
  const index = NOTES_TO_INDEXES[note];
  assert(typeof index == "number", NoteSequenceErrMsg.INVALID_NOTE, value);

  return { note: note, rest: rest.trim(), index: index, bassNote: bassNote };
}

export function stringifyNote(note: Note): string {
  if (note.bassNote)
    return `${note.note}${note.rest}/${stringifyNote(note.bassNote)}`;
  return `${note.note}${note.rest}`;
}

export interface Bar {
  notes: Note[];
}

export function parseBar(value: string): Bar {
  const val = value.trim();
  assert(val, NoteSequenceErrMsg.NO_VALUE, value);
  return { notes: val.split(/\s+/).map(parseNote) };
}

export function stringifyBar(value: Bar): string {
  return value.notes.map(stringifyNote).join(" ");
}

export interface BarLine {
  bars: Bar[];
}

export function parseBarLine(value: string): BarLine | undefined {
  const val = value.trim();
  if (!val) return;
  assert(val.startsWith("|"), NoteSequenceErrMsg.SHOULD_START_WITH, value);
  assert(val.endsWith("|"), NoteSequenceErrMsg.SHOULD_END_WITH, value);
  const rawBars = val.slice(1, -1).trim().split("|");
  return { bars: rawBars.map(parseBar) };
}

export function stringifyBarLine(value: BarLine): string {
  const joinedBars = value.bars.map(stringifyBar).join(" | ");
  return `| ${joinedBars} |`;
}

type NoteSequence = BarLine[];

export function parseNoteSequence(value: string): NoteSequence {
  return value
    .split("\n")
    .map(parseBarLine)
    .filter((barLine): barLine is BarLine => !!barLine);
}

export function stringifyNoteSequence(noteSequence: NoteSequence): string {
  return noteSequence.map(stringifyBarLine).join("\n");
}

function mod(number: number, remainder: number): number {
  return ((number % remainder) + remainder) % remainder;
}

export function transposeNote(note: Note, halfSteps: number): Note {
  const index = mod(note.index + halfSteps, 12);
  const bassNote = note.bassNote
    ? transposeNote(note.bassNote, halfSteps)
    : undefined;

  return {
    note: NORMALIZED_NOTES[index],
    rest: note.rest,
    index: index,
    bassNote: bassNote,
  };
}

function transposeNoteSequence(
  noteSequence: NoteSequence,
  halfSteps: number
): NoteSequence {
  return noteSequence.map((barLine) => ({
    bars: barLine.bars.map((bar) => ({
      notes: bar.notes.map((note) => transposeNote(note, halfSteps)),
    })),
  }));
}

export function getHalfSteps(
  key: SongChords.key,
  targetKey: SongChords.key
): number {
  return NORMALIZED_NOTES.indexOf(targetKey) - NORMALIZED_NOTES.indexOf(key);
}

function transposeNotes(
  notes: string,
  key: SongChords.key,
  targetKey: SongChords.key
): string {
  return stringifyNoteSequence(
    transposeNoteSequence(
      parseNoteSequence(notes),
      getHalfSteps(key, targetKey)
    )
  );
}

export function transposeSong(
  song?: Song,
  targetKey?: SongChords.key
): ChordsSection[] | undefined {
  if (!song?.chords || !targetKey) return;
  const chords = song.chords;

  const transposeSection = (section: ChordsSection) => ({
    name: section.name,
    notes: transposeNotes(section.notes, chords.key, targetKey),
  });

  return chords.sections.map(transposeSection);
}
