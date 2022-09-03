import type { AuthService } from "@/services/auth";
import type { SongService } from "@/services/song";
import type { UserService } from "./services/user";

function validateDependency<T>(d: T | undefined): T {
  if (!d) throw new Error(`Dependency ${d} not provided.`);
  return d;
}

function strictInject<T>(key: string): T {
  return validateDependency(inject(key));
}

export const songKey = "song-service";
export const useSongService = () => <SongService>strictInject(songKey);

export const authKey = "auth-service";
export const useAuthService = () => <AuthService>strictInject(authKey);

export const userKey = "user-service";
export const useUserService = () => <UserService>strictInject(userKey);
