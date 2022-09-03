/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ChordsSection } from "./ChordsSection";

export type SongChords = {
  key: SongChords.key;
  sections: Array<ChordsSection>;
};

export namespace SongChords {
  export enum key {
    C = "C",
    C_ = "C#",
    D = "D",
    D_ = "D#",
    E = "E",
    F = "F",
    F_ = "F#",
    G = "G",
    G_ = "G#",
    A = "A",
    A_ = "A#",
    B = "B",
  }
}
