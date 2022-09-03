import type { Song } from "@/client";
import { authKey, songKey } from "@/dependencies";
import { router } from "@/router";
import type { SongService } from "@/services/song";
import SongEdit from "@/views/SongEdit.vue";
import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import {
  mockAuthService,
  mockSong,
  mockSongService,
  mockUser,
} from "../fixtures";
import { waitForVeeValidate } from "../utils";

const defaultFetch = async () => undefined;
const defaultGet = () => mockSong;
const defaultUpdate = async () => undefined;

async function factory(
  fetch: SongService["fetch"],
  get: SongService["get"],
  update: SongService["update"]
) {
  const component = defineComponent({
    template: `<Suspense><SongEdit :id="id"></SongEdit></Suspense>`,
    components: { SongEdit },
    data: () => ({ id: mockSong.key }),
  });
  const wrapper = mount(component, {
    global: {
      provide: {
        [songKey]: mockSongService({ fetch, get, update }),
        [authKey]: mockAuthService({ user: ref(mockUser) }),
      },
      plugins: [router],
    },
  });
  await flushPromises();
  return wrapper;
}

async function submitForm(wrapper: VueWrapper) {
  await wrapper.get("button").trigger("submit");
  await waitForVeeValidate();
}

beforeEach(() => {
  vi.useFakeTimers();
});

it("renders", async () => {
  const fetch = vi.fn();
  const get = vi.fn(() => mockSong);
  const wrapper = await factory(fetch, get, defaultUpdate);

  expect(fetch).toBeCalledTimes(1);
  expect(get).toHaveCalls([mockSong.key]);

  const element = wrapper.get("input[name=name]").element as HTMLInputElement;
  expect(element.value).toBe(mockSong.name);
});

it("doesn't render because song is not found", async () => {
  const push = vi.spyOn(router, "push");
  await factory(defaultFetch, () => undefined, defaultUpdate);
  expect(push).toHaveCalls(["/"]);
});

test("submit works", async () => {
  const newSong: Song = { ...mockSong, name: "new name" };
  const update = vi.fn(async () => newSong);
  const wrapper = await factory(defaultFetch, defaultGet, update);
  const push = vi.spyOn(router, "push");

  await wrapper.get("input[name=name]").setValue(newSong.name);
  await submitForm(wrapper);

  expect(update).toHaveCalls([newSong]);
  expect(push).toHaveCalls([`/song/${mockSong.key}`]);
  expect(() => wrapper.getByTestId("error-message")).toThrow();
});

test("submit fails", async () => {
  const wrapper = await factory(defaultFetch, defaultGet, defaultUpdate);
  const push = vi.spyOn(router, "push");

  await submitForm(wrapper);
  expect(wrapper.getByTestId("error-message").text()).toBe("Нет доступа");
  expect(push).toBeCalledTimes(0);
});
