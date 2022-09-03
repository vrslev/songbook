<script setup lang="ts">
import type { SongNoKey } from "@/client";
import { useAuthService, useSongService } from "@/dependencies";
import { router } from "@/router";

const props = defineProps<{ id: string }>();
const songs = useSongService();
const auth = useAuthService();

const song = await getSong();
if (!song) router.push("/");

async function getSong() {
  if (!auth.user.value) return;
  await songs.fetch();
  return songs.get(props.id);
}

async function submit(value: SongNoKey): Promise<string | undefined> {
  const song = await songs.update({ ...value, key: props.id });
  if (!song) return "Нет доступа";
  await router.push(`/song/${song.key}`);
}
</script>

<template>
  <SongForm :song="song" :submit="submit" />
</template>
