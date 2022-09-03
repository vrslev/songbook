import type { Song } from "@/client";

export function getSongTitle(song: Song): string {
  return song.artist ? `${song.name} — ${song.artist}` : song.name;
}

export function getSongSubtitle(song?: Song): string | undefined {
  if (!song) return;
  if (song.original_name && song.artist)
    return `${song.original_name} — ${song.artist}`;
  if (song.original_name) return song.original_name;
  if (song.artist) return song.artist;
}
