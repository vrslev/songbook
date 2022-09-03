import type { Client, Song, SongNoKey } from "@/client";
import type { ComputedRef, Ref } from "vue";
import type { SuccessfulResponse } from "./utils";
import { safe } from "./utils";

export interface SongAPI {
  all: () => Promise<Song[]>;
  add: (requestBody: SongNoKey) => Promise<SuccessfulResponse<Song> | void>;
  delete: (key: string) => Promise<SuccessfulResponse<void> | void>;
  update: (
    key: string,
    requestBody: SongNoKey
  ) => Promise<SuccessfulResponse<Song> | void>;
}

export function getSongAPI(client: Client, authClient: Ref<Client>): SongAPI {
  return {
    all: () => client.song.songAll(),
    add: (requestBody) =>
      safe(() => authClient.value.song.songAdd(requestBody)),
    delete: (key) => safe(() => authClient.value.song.songDelete(key)),
    update: (key, requestBody) =>
      safe(() => authClient.value.song.songUpdate(key, requestBody)),
  };
}

export interface SongService {
  all: ComputedRef<Song[]>;
  fetch: () => Promise<void>;
  get: (key: string) => Song | undefined;
  add: (song: SongNoKey) => Promise<Song | undefined>;
  update: (song: Song) => Promise<Song | undefined>;
  delete: (key: string) => Promise<boolean>;
}

export function getSongService(api: SongAPI): SongService {
  const map = ref<{ [K: string]: Song }>({});
  const fetched = ref(false);

  return {
    all: computed(() => Object.values(map.value)),

    async fetch() {
      if (fetched.value) return;
      const response = await api.all();
      response.forEach((value) => (map.value[value.key] = value));
      fetched.value = true;
    },

    get: (key) => map.value[key],

    async add(song) {
      const response = await api.add(song);
      if (!response) return;
      map.value[response.value.key] = response.value;
      return response.value;
    },

    async update(song) {
      const response = await api.update(song.key, song);
      if (!response) return;
      map.value[response.value.key] = response.value;
      return response.value;
    },

    async delete(key) {
      const response = await api.delete(key);
      if (response) delete map.value[key];
      return Boolean(response);
    },
  };
}
