import type { Song } from "@/client";
import { getSongSubtitle, getSongTitle } from "@/core/utils";
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
