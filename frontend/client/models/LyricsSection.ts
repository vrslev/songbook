/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type LyricsSection = {
  name: LyricsSection.name;
  text: string;
};

export namespace LyricsSection {
  export enum name {
    ACAPELLA = "Acapella",
    BREAKDOWN = "Breakdown",
    BRIDGE = "Bridge",
    BRIDGE_1 = "Bridge 1",
    BRIDGE_2 = "Bridge 2",
    BRIDGE_3 = "Bridge 3",
    BRIDGE_4 = "Bridge 4",
    CHORUS = "Chorus",
    CHORUS_1 = "Chorus 1",
    CHORUS_2 = "Chorus 2",
    CHORUS_3 = "Chorus 3",
    CHORUS_4 = "Chorus 4",
    ENDING = "Ending",
    EXHORTATION = "Exhortation",
    INSTRUMENTAL = "Instrumental",
    INTERLUDE = "Interlude",
    INTRO = "Intro",
    OUTRO = "Outro",
    POST_CHORUS = "Post Chorus",
    PRE_CHORUS = "Pre Chorus",
    PRE_CHORUS_1 = "Pre Chorus 1",
    PRE_CHORUS_2 = "Pre Chorus 2",
    PRE_CHORUS_3 = "Pre Chorus 3",
    PRE_CHORUS_4 = "Pre Chorus 4",
    RAP = "Rap",
    REFRAIN = "Refrain",
    SOLO = "Solo",
    TAG = "Tag",
    TURNAROUND = "Turnaround",
    VAMP = "Vamp",
    VERSE = "Verse",
    VERSE_1 = "Verse 1",
    VERSE_2 = "Verse 2",
    VERSE_3 = "Verse 3",
    VERSE_4 = "Verse 4",
    VERSE_5 = "Verse 5",
    VERSE_6 = "Verse 6",
  }
}
