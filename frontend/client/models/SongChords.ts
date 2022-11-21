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
    DB = "Db",
    D = "D",
    D_ = "D#",
    EB = "Eb",
    E = "E",
    F = "F",
    F_ = "F#",
    GB = "Gb",
    G = "G",
    G_ = "G#",
    AB = "Ab",
    A = "A",
    A_ = "A#",
    BB = "Bb",
    H = "H",
  }
}
