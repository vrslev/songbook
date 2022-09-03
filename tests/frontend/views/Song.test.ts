// @vitest-environment jsdom https://github.com/vuejs/test-utils/issues/1385
import SongInfo from "@/components/SongInfo.vue";
import { authKey, songKey } from "@/dependencies";
import { router } from "@/router";
import type { AuthService } from "@/services/auth";
import type { SongService } from "@/services/song";
import Song from "@/views/Song.vue";
import { flushPromises, mount } from "@vue/test-utils";
import {
  mockAuthService,
  mockSong,
  mockSongService,
  mockUser,
} from "../fixtures";

function defaultGet(key: string) {
  expect(key).toBe(mockSong.key);
  return mockSong;
}
const defaultFetch = async () => undefined;

async function factory(authService: AuthService, songService: SongService) {
  const component = defineComponent({
    template: `<Suspense><Song id="${mockSong.key}" /></Suspense>`,
    components: { Song },
  });
  const wrapper = mount(component, {
    global: {
      provide: { [authKey]: authService, [songKey]: songService },
      plugins: [router],
    },
  });
  await flushPromises();
  return wrapper;
}

it("renders SongView", async () => {
  const fetch = vi.fn();
  const get = vi.fn(defaultGet);
  const wrapper = await factory(
    mockAuthService({ user: ref(mockUser) }),
    mockSongService({ fetch, get: get })
  );

  expect(fetch).toBeCalledTimes(1);
  expect(get).toHaveCalls([mockSong.key]);

  const props = expect.objectContaining({ song: mockSong, isLoggedIn: true });
  expect(wrapper.getComponent(SongInfo).props()).toStrictEqual(props);
  expect(wrapper.html()).toContain(mockSong.name);
});

test.each([true, false])("isLoggedIn", async (value) => {
  const wrapper = await factory(
    mockAuthService({ user: ref(value ? mockUser : undefined) }),
    mockSongService({ fetch: defaultFetch, get: defaultGet })
  );
  expect(wrapper.getComponent(SongInfo).props().isLoggedIn).toBe(value);
});

it("hidden", async () => {
  const wrapper = await factory(
    mockAuthService({}),
    mockSongService({ fetch: defaultFetch, get: () => undefined })
  );
  expect(() => wrapper.getComponent(SongInfo)).toThrow();
});

test.each([true, false])("delete emit", async (ok) => {
  const deleteSong = vi.fn(async () => ok);
  const wrapper = await factory(
    mockAuthService({}),
    mockSongService({
      fetch: defaultFetch,
      get: defaultGet,
      delete: deleteSong,
    })
  );
  const push = vi.spyOn(router, "push");

  wrapper.getComponent(SongInfo).vm.$emit("delete", mockSong.key);
  await flushPromises();

  expect(deleteSong).toHaveCalls([mockSong.key]);

  if (ok) expect(push).toHaveCalls(["/"]);
  else expect(push).toBeCalledTimes(0);
});
