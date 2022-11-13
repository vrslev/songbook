import {
  ChordsSection,
  LyricsSection,
  SongChords,
  SongTempo,
  type SongLinks,
  type SongNoKey,
} from "@/client";
import {
  array,
  mixed,
  number,
  object,
  string,
  type SchemaOf,
  type TestContext,
} from "yup";

import initChordChart, { validateChart } from "chord-chart-wasm";

function passEmptyObjectAsUndefined(value: { [K: string]: unknown }) {
  return Object.values(value).every((el) => !el) ? undefined : value;
}

function removeEmptyObjectsFromArray(value: { [K: string]: unknown }[]) {
  return value.filter((el) => passEmptyObjectAsUndefined(el));
}

async function validateNotes(value: string | undefined, ctx: TestContext) {
  if (!value) return true;
  await initChordChart;

  try {
    validateChart(value);
  } catch (e) {
    if (e instanceof Error) return ctx.createError({ message: e.message });
    return false;
  }

  return true;
}

function validateAppleMusicURL(value?: string) {
  if (!value) return true;
  return Boolean(value.match("^https://music.apple.com"));
}

function validateYoutubeURL(value?: string) {
  if (!value) return true;
  return Boolean(
    value.match("^https://youtube.com") ||
      value.match("^https://www.youtube.com")
  );
}

function nullToUndefined(value: unknown) {
  return value === null ? undefined : value;
}

const linksSchema: SchemaOf<SongLinks> = object({
  apple_music: string()
    .url()
    .test({ test: validateAppleMusicURL })
    .transform(nullToUndefined)
    .label("Apple Music link"),
  youtube: string()
    .url()
    .test({ test: validateYoutubeURL })
    .transform(nullToUndefined)
    .label("YouTube link"),
}).required();

const tempoSchema: SchemaOf<SongTempo> = object({
  bpm: number().required().label("BPM"),
  time_signature: mixed<SongTempo.time_signature>()
    .oneOf(Object.values(SongTempo.time_signature))
    .required()
    .label("Time Signature"),
});

const chordsSchema: SchemaOf<SongChords> = object({
  key: mixed<SongChords.key>()
    .oneOf(Object.values(SongChords.key))
    .required()
    .label("Key"),
  sections: array(
    object({
      name: mixed<ChordsSection.name>()
        .oneOf(Object.values(ChordsSection.name))
        .required()
        .label("Section"),
      notes: string().required().test({ test: validateNotes }).label("Notes"),
    })
  ),
}).transform((value) => {
  let sections: { [K: string]: unknown }[] | undefined =
    removeEmptyObjectsFromArray(value.sections || []);
  if (!sections.length) sections = undefined;
  return { ...value, sections };
});

const lyricsSectionSchema: SchemaOf<LyricsSection> = object({
  name: mixed<LyricsSection.name>()
    .oneOf(Object.values(LyricsSection.name))
    .required()
    .label("Section"),
  text: string().required().label("Text"),
});

function convertNullToUndefined(value: unknown) {
  return value == null ? undefined : value;
}

export const songSchema: SchemaOf<SongNoKey> = object({
  name: string().required().label("Name"),
  original_name: string()
    .transform(convertNullToUndefined)
    .label("Original Name"),
  artist: string().transform(convertNullToUndefined).label("Artist"),
  links: linksSchema,
  tempo: tempoSchema
    .transform(passEmptyObjectAsUndefined)
    .optional()
    .default(undefined),
  chords: chordsSchema
    .transform(passEmptyObjectAsUndefined)
    .optional()
    .default(undefined),
  lyrics: array(lyricsSectionSchema.optional())
    .transform(removeEmptyObjectsFromArray)
    .optional(),
});

export const userSchema = object({
  username: string().required(),
  password: string().required(),
});
