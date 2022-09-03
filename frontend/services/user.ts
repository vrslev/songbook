import type { Client, User, UserAdd, UserUpdatePasswordBody } from "@/client";
import type { ComputedRef, Ref } from "vue";
import type { SuccessfulResponse } from "./utils";
import { safe } from "./utils";

export interface UserAPI {
  all: () => Promise<SuccessfulResponse<User[]> | void>;
  add: (requestBody: UserAdd) => Promise<SuccessfulResponse<User> | void>;
  delete: (username: string) => Promise<SuccessfulResponse<void> | void>;
  updatePassword: (
    username: string,
    requestBody: UserUpdatePasswordBody
  ) => Promise<SuccessfulResponse<User> | void>;
}

export function getUserAPI(authClient: Ref<Client>): UserAPI {
  return {
    all: () => safe(() => authClient.value.user.userAll()),
    add: (requestBody) =>
      safe(() => authClient.value.user.userAdd(requestBody)),
    delete: (username) =>
      safe(() => authClient.value.user.userDelete(username)),
    updatePassword: (username, requestBody) =>
      safe(() =>
        authClient.value.user.userUpdatePassword(username, requestBody)
      ),
  };
}

export interface UserService {
  all: ComputedRef<User[]>;
  fetch: () => Promise<void>;
  add: (user: UserAdd) => Promise<User | undefined>;
  delete: (username: string) => Promise<boolean>;
  updatePassword: (username: string, password: string) => Promise<User | void>;
}

export function getUserService(api: UserAPI): UserService {
  const map = ref<{ [K: string]: User }>({});
  const fetched = ref(false);

  return {
    all: computed(() => Object.values(map.value)),
    async fetch() {
      if (fetched.value) return;
      const response = await api.all();
      if (!response) return;
      response.value.forEach((value) => (map.value[value.username] = value));
      fetched.value = true;
    },

    async add(user) {
      const response = await api.add(user);
      if (!response) return;
      map.value[response.value.username] = response.value;
      return response.value;
    },

    async delete(username) {
      const response = await api.delete(username);
      if (response) delete map.value[username];
      return Boolean(response);
    },

    async updatePassword(username, password) {
      const response = await api.updatePassword(username, { password });
      if (!response) return;
      map.value[response.value.username] = response.value;
      return response.value;
    },
  };
}
