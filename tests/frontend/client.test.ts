import { ChordsSection, LyricsSection } from "@/client";

test("Section names are same", () => {
  expect(ChordsSection.name).toStrictEqual(LyricsSection.name);
});
