<script setup lang="ts">
import type { Song } from "@/client";
import { getHash, updateHash } from "@/router";
import { useSearch } from "@/search";
import { PlusIcon } from "@heroicons/vue/20/solid";
import { watchDebounced } from "@vueuse/core";
import { useAuthService, useSongService } from "../dependencies";

const auth = useAuthService();
const songs = useSongService();
const searchQuery = ref(getHash());
const searchResults = useSearch(searchQuery, songs.all, {
  keys: ["name", "artist"],
});
const results = computed<Song[]>(() =>
  searchQuery.value ? searchResults.value : songs.all.value
);

songs.fetch();
watchDebounced(searchQuery, updateHash, { debounce: 500 });
</script>

<template>
  <div class="grid gap-3">
    <div class="flex gap-2">
      <input
        type="search"
        placeholder="Искать"
        v-model="searchQuery"
        class="input-bordered input flex-auto rounded-xl dark:border-none"
        data-test="search-input"
      />

      <RouterLink
        v-if="auth.user.value"
        to="/song/add"
        class="btn"
        data-test="add-btn"
      >
        <PlusIcon class="icon" />
      </RouterLink>
    </div>
    <div class="grid items-center divide-y divide-base-300">
      <RouterLink
        v-for="(song, idx) in results"
        :key="idx"
        :to="`/song/${song.key}`"
        class="bg-base-100 p-3 px-7 first:rounded-t-xl first:pt-4 last:rounded-b-xl last:pb-4 hover:bg-base-300"
        data-test="song"
      >
        <h1 class="text-base-content">{{ song.name }}</h1>
        <p class="base-content-secondary text-sm">{{ song.artist }}</p>
      </RouterLink>
    </div>
  </div>
</template>
