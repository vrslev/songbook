import type { SongNoKey } from "@/client";
import { songSchema, userSchema } from "@/core/validation";
import { ValidationError } from "yup";
import { mockSongNoKey } from "../fixtures";

describe("song schema", () => {
  it.each([
    { name: "Song name" },
    { name: "Song name", chords: {}, links: {}, tempo: undefined },
    { name: "Song name", original_name: null, artist: null },
  ])("passes", async (value: unknown) => {
    await songSchema.validate(value);
  });

  it("does not change result", async () => {
    expect(await songSchema.validate(mockSongNoKey)).toEqual(mockSongNoKey);
  });

  it("passes with extra rows", async () => {
    const newObj = JSON.parse(JSON.stringify(mockSongNoKey)) as SongNoKey;

    // @ts-ignore
    newObj.chords?.sections.push({});
    // @ts-ignore
    newObj.chords?.sections.push({ name: undefined, notes: undefined });
    // @ts-ignore
    newObj.lyrics?.push({});
    // @ts-ignore
    newObj.lyrics?.push({ name: undefined, text: undefined });

    const result = await songSchema.validate(newObj);
    expect(result).toEqual(mockSongNoKey);
  });

  it.each([
    {},
    { name: "Song name", tempo: { bpm: 27.5, time_signature: undefined } },
    {
      name: "Song name",
      chords: {
        key: "D",
        sections: [{ name: "Acapella", notes: "Some text" }],
      },
    },
  ])("fails", (value: unknown) => {
    expect(() => songSchema.validateSync(value)).toThrow(ValidationError);
  });
});

describe("login schema", () => {
  it("passes", async () => {
    await userSchema.validate({ username: "lev", password: "pass" });
  });

  it.each([{ username: "lev" }, {}, { password: "pass" }])(
    "fails",
    (value: unknown) => {
      expect(() => userSchema.validateSync(value)).toThrow(ValidationError);
    }
  );
});
