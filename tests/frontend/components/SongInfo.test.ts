// @vitest-environment jsdom https://github.com/vuejs/test-utils/issues/1385
import { SongChords } from "@/client";
import SongInfo from "@/components/SongInfo.vue";
import SongInfoTextSections from "@/components/SongInfoTextSections.vue";
import { sectionsTranslations } from "@/i18n";
import { router } from "@/router";
import { DOMWrapper, flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { mockSong } from "../fixtures";
import { dataTestId } from "../utils";

function factory(isLoggedIn = false, song = mockSong) {
  return mount(SongInfo, {
    props: { song, isLoggedIn },
    global: { plugins: [router] },
  });
}

test("name", () => {
  const text = factory().getByTestId("name").text();
  expect(text).toEqual(mockSong.name);
});

describe("subtitile", () => {
  it("shown", () => {
    const text = factory().getByTestId("subtitle").text();
    expect(text).toBe(`${mockSong.original_name} — ${mockSong.artist}`);
  });

  it("hidden", () => {
    const song = {
      ...mockSong,
      original_name: undefined,
      artist: undefined,
    };
    const wrapper = factory(false, song);
    expect(() => wrapper.getByTestId("subtitle")).toThrow();
  });
});

describe("edit button", () => {
  it("shown", () => {
    const wrapper = factory(true);
    const element = wrapper.getByTestId("edit-btn");

    expect(element.element.innerHTML).toBeTruthy();
    expect(element.attributes().href).toBe(`/song/${mockSong.key}/edit`);
  });

  it("hidden", () => {
    const wrapper = factory();
    expect(() => wrapper.getByTestId("edit-btn")).toThrow();
  });
});

describe("delete button", () => {
  it("shown and works", async () => {
    const wrapper = factory(true);
    const element = wrapper.getByTestId("delete-btn");

    expect(element.element.innerHTML).toBeTruthy();
    await element.trigger("click");
    expect(wrapper.emitted("delete")).toBeFalsy();

    // TODO: Test modal
    // const deleteYesBtn = document.querySelector("[data-test=delete-yes-btn]");
    // assert(deleteYesBtn);
    // const deleteYesBtnWrapper = new DOMWrapper(deleteYesBtn);
    // await deleteYesBtnWrapper.trigger("click");

    // expect(wrapper.emitted("delete")).toStrictEqual([[mockSong.key]]);
  });

  it("hidden", () => {
    const wrapper = factory();
    expect(() => wrapper.getByTestId("delete-btn")).toThrow();
  });
});

describe("Apple Music button", () => {
  it("shown", () => {
    const element = factory().getByTestId("apple-music-btn");
    expect(element.text()).toBe("Apple Music");
    expect(element.attributes().href).toBe(mockSong.links.apple_music);
  });

  it("hidden", () => {
    const wrapper = factory(false, { ...mockSong, links: {} });
    expect(() => wrapper.getByTestId("apple-music-btn")).toThrow();
  });
});

describe("YouTube button", () => {
  it("shown", () => {
    const element = factory().getByTestId("youtube-btn");
    expect(element.text()).toBe("YouTube");
    expect(element.attributes().href).toBe(mockSong.links.youtube);
  });

  it("hidden", () => {
    const wrapper = factory(false, { ...mockSong, links: {} });
    expect(() => wrapper.getByTestId("youtube-btn")).toThrow();
  });
});

function getEntriesFromSongTextSection(component: Omit<VueWrapper, "exists">) {
  return component.findAll(dataTestId("section")).map((section) => ({
    name: section.getByTestId("name").text(),
    rows: section.findAll(dataTestId("row")).map((row) => row.text()),
  }));
}

describe("chords", () => {
  function getKeySwitcherValue(select: Omit<DOMWrapper<Element>, "exists">) {
    return (select as Omit<DOMWrapper<HTMLSelectElement>, "exists">).element
      .value;
  }

  function getNotes(wrapper: ReturnType<typeof factory>) {
    return getEntriesFromSongTextSection(
      wrapper.getByTestId("chords").getComponent(SongInfoTextSections)
    ).map(({ name, rows }) => ({ name, notes: rows.join("\n") }));
  }

  const oldNotes = mockSong.chords?.sections.map(({ name, notes }) => ({
    name: sectionsTranslations[name],
    notes,
  }));
  const newKey = "A";
  const newNotes = [
    {
      name: sectionsTranslations["Acapella"],
      notes: "| C | G | A |\n| C | G | A |\n| C | G | A |",
    },
    {
      name: sectionsTranslations["Verse 1"],
      notes: "| C | G | A |\n| C | G | A |\n| C | G | A |",
    },
  ];

  it("hidden", () => {
    const wrapper = factory(false, { ...mockSong, chords: undefined });
    expect(() => wrapper.getByTestId("chords")).toThrow();
  });

  it("shows key switcher", () => {
    const wrapper = factory();
    const select = wrapper.getByTestId("key-select");
    const options = select
      .findAll("option")
      .map((o: DOMWrapper<Node>) => o.text());

    expect(wrapper.getByTestId("key-name").text()).toBe("Тональность");
    expect(getKeySwitcherValue(select)).toBe(mockSong.chords?.key);
    expect(options).toStrictEqual(Object.values(SongChords.key));
  });

  it("shows notes", () => {
    expect(getNotes(factory())).toStrictEqual(oldNotes);
  });

  test("key from hash", async () => {
    await router.push({ hash: `#${newKey}` });
    const wrapper = factory();

    expect(getKeySwitcherValue(wrapper.getByTestId("key-select"))).toBe(newKey);
    expect(getNotes(wrapper)).toStrictEqual(newNotes);
    await router.push({ hash: undefined });
  });

  test("key switcher works", async () => {
    async function check(notes: unknown, key?: string) {
      await flushPromises();
      expect(getNotes(wrapper)).toStrictEqual(notes);
      expect(router.currentRoute.value.hash).toBe(`#${key}`);
    }

    const wrapper = factory();
    const select = () => wrapper.getByTestId("key-select");

    await check(oldNotes, mockSong.chords?.key);

    await select().setValue(newKey);
    expect(getKeySwitcherValue(select())).toBe(newKey);
    await check(newNotes, newKey);
  });
});

describe("lyrics", () => {
  it("hidden", () => {
    const wrapper = factory(false, { ...mockSong, lyrics: undefined });
    expect(() => wrapper.getByTestId("lyrics")).toThrow();
  });

  it("shown", () => {
    const lyrics = getEntriesFromSongTextSection(
      factory().getByTestId("lyrics").getComponent(SongInfoTextSections)
    ).map(({ name, rows }) => ({ name, text: rows.join("\n") }));
    expect(lyrics).toStrictEqual(
      mockSong.lyrics?.map(({ name, text }) => ({
        name: sectionsTranslations[name],
        text,
      }))
    );
  });
});
