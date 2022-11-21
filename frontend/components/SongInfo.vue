<script setup lang="ts">
import { SongChords, type Song } from "@/client";
import { transposeSong } from "@/core/utils";
import { getSongSubtitle, getSongTitle } from "@/core/utils";
import { sectionsTranslations } from "@/i18n";
import { getHash, updateHash } from "@/router";
import { PencilIcon, TrashIcon } from "@heroicons/vue/20/solid";
import { RouterLink } from "vue-router";

const props = defineProps<{ song: Song; isLoggedIn: boolean }>();
defineEmits<{
  (e: "delete", key: string): Promise<void>;
}>();

const subtitle = getSongSubtitle(props.song);

document.title = getSongTitle(props.song);

const currentKey = ref<SongChords.key | undefined>();
watch(currentKey, updateHash);
currentKey.value = getKey();

const chordsSections = computed(() =>
  transposeSong(props.song, currentKey.value)?.map((section) => ({
    name: sectionsTranslations[section.name],
    rows: section.notes.split("\n"),
  }))
);
const lyricsSections = props.song.lyrics?.map((section) => ({
  name: sectionsTranslations[section.name],
  rows: section.text.split("\n"),
}));

function getKey() {
  const hash = getHash() as SongChords.key;
  return Object.values(SongChords.key).includes(hash)
    ? hash
    : props.song.chords?.key;
}
</script>

<template>
  <div>
    <section class="grid gap-3">
      <div class="grid items-center">
        <h1 class="text-2xl font-medium" data-test="name">{{ song.name }}</h1>
        <p v-if="subtitle" class="base-content-secondary" data-test="subtitle">
          {{ subtitle }}
        </p>
      </div>
      <div
        class="grid auto-cols-auto grid-flow-col auto-rows-auto items-center justify-start gap-2"
      >
        <template v-if="isLoggedIn">
          <RouterLink
            :to="`/song/${song.key}/edit`"
            class="title-btn"
            data-test="edit-btn"
          >
            <PencilIcon class="icon" />
          </RouterLink>

          <SongInfoDeleteConfirmation
            :submit="() => $emit('delete', song.key)"
            v-slot="{ open }"
          >
            <button @click="open" class="title-btn" data-test="delete-btn">
              <TrashIcon class="icon" />
            </button>
          </SongInfoDeleteConfirmation>
        </template>
        <a
          v-if="song.links.apple_music"
          :href="song.links.apple_music"
          class="title-btn"
          data-test="apple-music-btn"
          >Apple Music</a
        >
        <a
          v-if="song.links.youtube"
          :href="song.links.youtube"
          class="title-btn"
          data-test="youtube-btn"
          >YouTube</a
        >
      </div>
    </section>
    <section v-if="chordsSections" class="gap-3" data-test="chords">
      <div class="grid justify-start gap-1">
        <h3 for="key" class="base-content-secondary" data-test="key-name">
          Тональность
        </h3>
        <select
          class="select-bordered select select-xs"
          name="key"
          v-model="currentKey"
          data-test="key-select"
        >
          <option
            v-for="(note, idx) in Object.values(SongChords.key)"
            :key="idx"
            :value="note"
          >
            {{ note }}
          </option>
        </select>
      </div>
      <SongInfoTextSections :sections="chordsSections" />
    </section>
    <section v-if="lyricsSections" class="gap-3" data-test="lyrics">
      <SongInfoTextSections :sections="lyricsSections" />
    </section>
  </div>
</template>

<style scoped>
section {
  @apply mb-2 grid rounded-2xl bg-base-100 p-5 px-7;
}

.title-btn {
  @apply btn-outline btn-sm btn whitespace-nowrap;
}

article {
  @apply grid gap-1 p-2 px-0;
}

h3 {
  @apply text-sm uppercase;
}
</style>
