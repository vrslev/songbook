<script setup lang="ts">
import { useAuthService, useSongService } from "@/dependencies";
import { router } from "@/router";

const props = defineProps<{ id: string }>();
const auth = useAuthService();
const songs = useSongService();

await songs.fetch();
const song = songs.get(props.id);

async function deleteSong(key: string): Promise<void> {
  if (await songs.delete(key)) await router.push("/");
}
</script>

<template>
  <SongInfo
    v-if="song"
    :song="song"
    :is-logged-in="Boolean(auth.user.value)"
    @delete="deleteSong"
  />
</template>
