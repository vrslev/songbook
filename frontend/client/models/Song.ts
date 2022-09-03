/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LyricsSection } from "./LyricsSection";
import type { SongChords } from "./SongChords";
import type { SongLinks } from "./SongLinks";
import type { SongTempo } from "./SongTempo";

export type Song = {
  name: string;
  original_name?: string;
  artist?: string;
  links: SongLinks;
  tempo?: SongTempo;
  chords?: SongChords;
  lyrics?: Array<LyricsSection>;
  key: string;
};
