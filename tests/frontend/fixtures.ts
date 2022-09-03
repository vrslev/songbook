import type {
  ChordsSection,
  LyricsSection,
  Song,
  SongChords,
  SongNoKey,
  SongTempo,
  User,
  UserAdd,
} from "@/client";
import type { AuthAPI, AuthService } from "@/services/auth";
import type { SongAPI, SongService } from "@/services/song";
import type { UserAPI, UserService } from "@/services/user";
import { justThrows } from "./utils";

export const mockToken = "my token";

export const mockSongNoKey: SongNoKey = {
  name: "Do It Again",
  original_name: "Do It Again",
  artist: "Elevation Worship",
  links: {
    apple_music:
      "https://music.apple.com/ru/album/do-it-again-live/1192789472?i=1192789624&l=en",
    youtube: "https://www.youtube.com/watch?v=ZOBIPb-6PTc",
  },
  tempo: { bpm: 27.5, time_signature: "4/4" as SongTempo.time_signature },
  chords: {
    key: "D" as SongChords.key,
    sections: [
      {
        name: "Acapella" as ChordsSection.name,
        notes: "| F | C | D |\n| F | C | D |\n| F | C | D |",
      },
      {
        name: "Verse 1" as ChordsSection.name,
        notes: "| F | C | D |\n| F | C | D |\n| F | C | D |",
      },
    ],
  },
  lyrics: [
    { name: "Acapella" as LyricsSection.name, text: "LALALA\nLALALA\nLALALA" },
    { name: "Verse 1" as LyricsSection.name, text: "LALALA\nLALALA\nLALALA" },
  ],
};
export const mockSong: Song = { ...mockSongNoKey, key: "my key" };
export const mockSong2: Song = {
  ...mockSong,
  name: "What a Beautiful Name",
  artist: "Hillsong Worship",
};

export const mockUser: User = { username: "john", is_superuser: false };
export const mockUserAdd: UserAdd = { username: "john", password: "pwd" };
export const mockSuperuser: User = { is_superuser: true, username: "super" };

export function mockAuthAPI({ login, me }: Partial<AuthAPI>): AuthAPI {
  return { login: login || justThrows, me: me || justThrows };
}

export function mockSongAPI({
  all,
  add,
  delete: deleteSong,
  update,
}: Partial<SongAPI>): SongAPI {
  return {
    all: all || justThrows,
    add: add || justThrows,
    delete: deleteSong || justThrows,
    update: update || justThrows,
  };
}

export function mockUserAPI({
  all,
  add,
  delete: deleteSong,
  updatePassword,
}: Partial<UserAPI>): UserAPI {
  return {
    all: all || justThrows,
    add: add || justThrows,
    delete: deleteSong || justThrows,
    updatePassword: updatePassword || justThrows,
  };
}

export function mockAuthService({
  user,
  login,
  logout,
  fetchUser,
}: Partial<AuthService>): AuthService {
  return {
    user: user || ref(),
    login: login || justThrows,
    logout: logout || justThrows,
    fetchUser: fetchUser || justThrows,
  };
}

export function mockSongService({
  all,
  fetch,
  get,
  add,
  update,
  delete: deleteSong,
}: Partial<SongService>): SongService {
  return {
    /* c8 ignore next 2 */
    all: all || computed(() => []),
    fetch: fetch || justThrows,
    get: get || justThrows,
    add: add || justThrows,
    update: update || justThrows,
    delete: deleteSong || justThrows,
  };
}

export function mockUserService({
  all,
  fetch,
  add,
  delete: deleteSong,
  updatePassword,
}: Partial<UserService>): UserService {
  return {
    all: all || computed(() => []),
    fetch: fetch || justThrows,
    add: add || justThrows,
    delete: deleteSong || justThrows,
    updatePassword: updatePassword || justThrows,
  };
}
