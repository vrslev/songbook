import type { ChordsSection, Song, SongChords } from "@/client";
import { tranposeChart } from "chord-chart";

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

export function transposeSong(
  song?: Song,
  targetKey?: SongChords.key
): ChordsSection[] | undefined {
  if (!song?.chords || !targetKey) return;
  const chords = song.chords;

  const transposeSection = (section: ChordsSection) => ({
    name: section.name,
    notes: tranposeChart(section.notes, chords.key, targetKey),
  });

  return chords.sections.map(transposeSection);
}
