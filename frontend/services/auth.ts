import type { Client, Token, User, Body_auth_login } from "@/client";
import { useLocalStorage } from "@vueuse/core";
import type { Ref } from "vue";
import { handlingAuthErrors } from "./utils";

export interface AuthAPI {
  login: (formData: Body_auth_login) => Promise<Token>;
  me: () => Promise<User>;
}

export function getAuthAPI(client: Client, authClient: Ref<Client>): AuthAPI {
  return {
    login: (formData: Body_auth_login) => client.auth.authLogin(formData),
    me: () => authClient.value.auth.authMe(),
  };
}

export interface AuthService {
  user: Ref<User | undefined>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const token = useLocalStorage<string | null>("token", null);

export function getAuthService(api: AuthAPI): AuthService {
  const user = ref<User | undefined>();
  function logout() {
    user.value = undefined;
    token.value = null;
  }
  async function fetchUser() {
    await handlingAuthErrors(async () => {
      user.value = await api.me();
    }, logout);
  }

  return {
    user: readonly(user),
    async login(username, password) {
      const response = await api.login({
        grant_type: "password",
        username: username,
        password: password,
      });
      token.value = response.access_token;
    },
    logout,
    fetchUser,
  };
}
