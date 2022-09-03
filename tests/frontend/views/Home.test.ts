import type { Song, User } from "@/client";
import { authKey, songKey } from "@/dependencies";
import { router } from "@/router";
import Home from "@/views/Home.vue";
import { DOMWrapper, mount } from "@vue/test-utils";
import type { Ref } from "vue";
import {
  mockAuthService,
  mockSong,
  mockSong2,
  mockSongService,
  mockUser,
} from "../fixtures";
import { dataTestId } from "../utils";

const songId = dataTestId("song");

const songService = mockSongService({
  all: computed(() => [mockSong, mockSong2]),
  fetch: async () => undefined,
});

function factory(user?: Ref<User>) {
  return mount(Home, {
    global: {
      provide: { [songKey]: songService, [authKey]: mockAuthService({ user }) },
      plugins: [router],
    },
  });
}

function checkItem(el: DOMWrapper<Element>, song: Song) {
  const text = el.text();
  expect(text).toContain(song.name);
  expect(text).toContain(song.artist);
  expect(el.attributes().href).toBe(`/song/${song.key}`);
}

function checkDefaultItems(elements: DOMWrapper<Element>[]) {
  expect(elements).toHaveLength(2);
  checkItem(elements[0], mockSong);
  checkItem(elements[1], mockSong2);
}

it("shows song list", async () => {
  const elements = factory().findAll(songId);
  checkDefaultItems(elements);
});

test("search works", async () => {
  const wrapper = factory();
  const input = wrapper.getByTestId("search-input");
  await input.setValue("What a Beautifu");

  let elements = wrapper.findAll(songId);
  expect(elements).toHaveLength(1);
  checkItem(elements[0], mockSong2);

  await input.setValue("");
  elements = wrapper.findAll(songId);
  checkDefaultItems(elements);

  await input.setValue("Elevation");
  elements = wrapper.findAll(songId);
  expect(elements).toHaveLength(1);
  checkItem(elements[0], mockSong);
});

it("doesn't show add button", () => {
  const wrapper = factory();
  expect(() => wrapper.getByTestId("add-btn")).toThrow();
});

it("shows add button", () => {
  const wrapper = factory(ref(mockUser));
  expect(wrapper.getByTestId("add-btn")).toBeTruthy();
});
