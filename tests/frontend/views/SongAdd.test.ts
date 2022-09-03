import type { Song, SongNoKey } from "@/client";
import { authKey, songKey } from "@/dependencies";
import { router } from "@/router";
import type { SongService } from "@/services/song";
import SongAdd from "@/views/SongAdd.vue";
import { mount, VueWrapper } from "@vue/test-utils";
import { mockAuthService, mockSongService } from "../fixtures";
import { buildAPIError, waitForVeeValidate } from "../utils";

function factory(add?: SongService["add"]) {
  return mount(SongAdd, {
    global: {
      provide: {
        [songKey]: mockSongService({ add }),
        [authKey]: mockAuthService({}),
      },
    },
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

test("renders", () => {
  const element = factory().get("input[name=name]").element as HTMLInputElement;
  expect(element.value).toBeFalsy();
});

async function submitForm(wrapper: VueWrapper, name: string) {
  await wrapper.get("input[name=name]").setValue(name);
  await wrapper.get("button").trigger("submit");
  await waitForVeeValidate();
}

test("submit works", async () => {
  const songNoKey: SongNoKey = {
    name: "Song name",
    links: { apple_music: undefined, youtube: undefined },
    lyrics: [],
  };
  const song: Song = { ...songNoKey, key: "1" };

  const add = vi.fn(async () => song);
  const wrapper = factory(add);
  const push = vi.spyOn(router, "push");

  await submitForm(wrapper, song.name);

  expect(() => wrapper.getByTestId("error-message")).toThrow();
  expect(add).toHaveCalls([songNoKey]);
  expect(push).toHaveCalls([`/song/${song.key}`]);
});

test.each([
  [
    async () => {
      throw buildAPIError(409, "");
    },
    "уже существует",
  ],
  [async () => undefined, "Нет доступа"],
])("submit fails gracefully", async (add, message) => {
  const wrapper = factory(add);
  const push = vi.spyOn(router, "push");

  await submitForm(wrapper, "s");
  expect(wrapper.getByTestId("error-message").text()).toContain(message);
  expect(push).toBeCalledTimes(0);
});

test.each([buildAPIError(500, ""), new Error()])(
  "submit throws",
  async (error) => {
    const add = async () => {
      throw error;
    };
    const errorHandler = vi.fn();
    const wrapper = mount(SongAdd, {
      global: {
        provide: {
          [songKey]: mockSongService({ add }),
          [authKey]: mockAuthService({}),
        },
        config: { errorHandler },
      },
    });
    const push = vi.spyOn(router, "push");

    await submitForm(wrapper, "s");
    expect(errorHandler).toHaveCalls([
      error,
      expect.anything(),
      expect.anything(),
    ]);
    expect(push).toBeCalledTimes(0);
  }
);
