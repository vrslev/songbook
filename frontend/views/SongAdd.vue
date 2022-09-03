<script setup lang="ts">
import { ApiError, type SongNoKey } from "@/client";
import { useAuthService, useSongService } from "@/dependencies";
import { router } from "@/router";

const songs = useSongService();
const auth = useAuthService();

if (!auth.user.value) router.push("/");

async function submit(value: SongNoKey): Promise<string | undefined> {
  try {
    const song = await songs.add(value);
    if (!song) return "Нет доступа";
    await router.push(`/song/${song.key}`);
  } catch (e) {
    if (e instanceof ApiError && e.status == 409)
      return "Песня с таким названием и исполнителем уже существует";
    throw e;
  }
}
</script>

<template>
  <SongForm :song="undefined" :submit="submit" />
</template>
