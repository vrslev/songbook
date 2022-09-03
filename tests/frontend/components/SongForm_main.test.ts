import type { Song, SongNoKey } from "@/client";
import SongForm from "@/components/SongForm.vue";
import { mount, VueWrapper } from "@vue/test-utils";
import { mockSong, mockSongNoKey } from "../fixtures";
import { waitForVeeValidate } from "../utils";

async function submitForm(wrapper: VueWrapper) {
  await wrapper.get("button").trigger("submit");
  await waitForVeeValidate();
}

function factory(song: unknown, submit: unknown) {
  // @ts-ignore
  return mount(SongForm, { props: { song, submit } });
}

beforeAll(() => {
  vi.useFakeTimers();
});

it("is idempotent", async () => {
  const submit = vi.fn();
  const wrapper = factory(mockSong, submit);

  await submitForm(wrapper);
  expect(submit).toHaveCalls([expect.objectContaining(mockSongNoKey)]);
});

test.each([
  [true, { ...mockSong, name: "New name" }],
  [
    false,
    {
      name: "New name",
      links: { apple_music: undefined, youtube: undefined },
      lyrics: [],
    },
  ],
])("submit", async (initial: boolean, song: SongNoKey | Song) => {
  const submit = vi.fn();
  const wrapper = factory(initial ? song : undefined, submit);

  await wrapper.get("input[name=name]").setValue(song.name);
  await submitForm(wrapper);
  expect(submit).toHaveCalls([song]);
});

describe("error message", () => {
  test("set", async () => {
    const error = "Some error";
    const wrapper = factory(mockSong, () => error);
    await submitForm(wrapper);
    expect(wrapper.getByTestId("error-message").text()).toBe(error);
  });

  test("not set", async () => {
    const wrapper = factory(mockSong, () => undefined);
    await submitForm(wrapper);
    expect(() => wrapper.getByTestId("error-message")).toThrow();
  });
});

describe("button class", () => {
  test("ok", () => {
    const wrapper = factory(mockSong, () => undefined);
    const classes = wrapper.get("button").classes();
    ["btn-error", "loading"].forEach((cls) => {
      expect(classes).not.toContain(cls);
    });
  });

  test("loading", async () => {
    const wrapper = factory(mockSong, () => undefined);
    const button = wrapper.get("button");

    await button.trigger("submit");
    const classes = button.classes();
    expect(classes).toContain("loading");
    expect(classes).not.toContain("btn-error");
  });

  test("error", async () => {
    const wrapper = factory(mockSong, () => "Some error");
    await submitForm(wrapper);
    const classes = wrapper.get("button").classes();
    expect(classes).not.toContain("loading");
    expect(classes).toContain("btn-error");
  });
});
