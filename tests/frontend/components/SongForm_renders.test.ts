// @vitest-environment jsdom: support dot in selectors: https://github.com/capricorn86/happy-dom/issues/512
import { ChordsSection, LyricsSection, SongTempo } from "@/client";
import SongForm from "@/components/SongForm.vue";
import { NORMALIZED_NOTES } from "@/core/noteSequence";
import { sectionsTranslations } from "@/i18n";
import { DOMWrapper, mount, VueWrapper } from "@vue/test-utils";
import { mockSong } from "../fixtures";
import { dataTestId } from "../utils";

type InputOrSelect = Omit<
  DOMWrapper<HTMLInputElement | HTMLSelectElement>,
  "exists"
>;

function getInputOrSelect(wrapper: VueWrapper, name: string) {
  return wrapper.get(`[name="${name}"]`) as InputOrSelect;
}

let wrapper: VueWrapper;
beforeAll(() => {
  vi.useFakeTimers();
  wrapper = mount(SongForm, {
    props: { song: mockSong, submit: async () => undefined },
  });
});

test.each([
  ["name", mockSong.name],
  ["original_name", mockSong.original_name],
  ["artist", mockSong.artist],
  ["links.apple_music", mockSong.links.apple_music],
  ["links.youtube", mockSong.links.youtube],
  ["tempo.bpm", String(mockSong.tempo?.bpm)],
])("text fields", (name: string, content?: string) => {
  const element = getInputOrSelect(wrapper, name);
  expect(element.element.value).toBe(content);
});

test.each([
  [
    "tempo.time_signature",
    Object.values(SongTempo.time_signature),
    mockSong.tempo?.time_signature,
  ],
  ["chords.key", NORMALIZED_NOTES, mockSong.chords?.key],
])("select fields", (name: string, options: string[], content?: string) => {
  const element = getInputOrSelect(wrapper, name);
  expect(element.element.value).toBe(content);
  expect(element.findAll("option").map((o) => o.text())).toStrictEqual([
    "",
    ...options,
  ]);
});

test("chords sections", () => {
  const sections = wrapper.findAll(dataTestId("chords"));
  sections.forEach((s) => {
    expect(s.findAll("option").map((o) => o.text())).toStrictEqual([
      "",
      ...Object.values(ChordsSection.name).map(
        (value) => sectionsTranslations[value]
      ),
    ]);
  });
  const parsed: ChordsSection[] = sections.map((s) => ({
    name: s.get("select").element.value as ChordsSection.name,
    notes: s.get("textarea").element.value,
  }));
  expect(parsed).toStrictEqual(
    mockSong.chords?.sections?.concat({
      name: "" as ChordsSection.name,
      notes: "",
    })
  );
});

test("lyrics sections", () => {
  const sections = wrapper.findAll(dataTestId("lyrics"));
  sections.forEach((s) => {
    expect(s.findAll("option").map((o) => o.text())).toStrictEqual([
      "",
      ...Object.values(LyricsSection.name).map(
        (value) => sectionsTranslations[value]
      ),
    ]);
  });
  const parsed: LyricsSection[] = sections.map((section) => ({
    name: section.get("select").element.value as LyricsSection.name,
    text: section.get("textarea").element.value,
  }));
  expect(parsed).toStrictEqual(
    mockSong.lyrics?.concat({ name: "" as LyricsSection.name, text: "" })
  );
});
