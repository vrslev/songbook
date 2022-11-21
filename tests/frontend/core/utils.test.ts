import type { ChordsSection, Song, SongChords } from "@/client";
import { getSongSubtitle, getSongTitle, transposeSong } from "@/core/utils";
import { mockSong } from "../fixtures";

let song: Song;

beforeEach(() => {
  song = { ...mockSong };
});

describe("getSongTitle", () => {
  test("full", () => {
    expect(getSongTitle(song)).toBe(`${song.name} — ${song.artist}`);
  });

  test("without artist", () => {
    song.artist = undefined;
    expect(getSongTitle(song)).toBe(song.name);
  });
});

describe("getSongSubtitle", () => {
  test("no song", () => {
    expect(getSongSubtitle(undefined)).toBeUndefined();
  });

  test("full", () => {
    expect(getSongSubtitle(song)).toBe(
      `${song.original_name} — ${song.artist}`
    );
  });

  test("without artist", () => {
    song.artist = undefined;
    expect(getSongSubtitle(song)).toBe(song.original_name);
  });

  test("without original name", () => {
    song.original_name = undefined;
    expect(getSongSubtitle(song)).toBe(song.artist);
  });

  test("without original name and artist", () => {
    song.artist = undefined;
    song.original_name = undefined;
    expect(getSongSubtitle(song)).toBeUndefined();
  });
});

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
