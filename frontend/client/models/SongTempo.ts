/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SongTempo = {
  bpm: number;
  time_signature: SongTempo.time_signature;
};

export namespace SongTempo {
  export enum time_signature {
    _3_4 = "3/4",
    _4_4 = "4/4",
    _6_4 = "6/4",
    _6_8 = "6/8",
    _8_8 = "8/8",
  }
}
