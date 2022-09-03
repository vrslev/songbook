import { Token, type Body_auth_login, type User } from "@/client";
import { getAuthService, token } from "@/services/auth";
import { mockAuthAPI, mockToken, mockUser } from "../fixtures";
import { buildAPIError } from "../utils";

afterEach(() => {
  // reset localStorage token value
  token.value = null;
});

const username = "username";
const password = "pwd";

async function login(formData: Body_auth_login) {
  expect(formData).toStrictEqual({
    grant_type: "password",
    username,
    password,
  });
  return {
    token_type: Token.token_type.BEARER,
    access_token: mockToken,
  };
}

async function me(): Promise<User> {
  return mockUser;
}

test("login", async () => {
  const service = getAuthService(mockAuthAPI({ login }));
  expect(await service.login(username, password)).toBeUndefined();
  expect(token.value).toBe(mockToken);
});

test("logout", async () => {
  const service = getAuthService(mockAuthAPI({ login, me }));
  await service.login(username, password);
  await service.fetchUser();
  service.logout();

  expect(service.user.value).toBeUndefined();
  expect(token.value).toBeNull();
});

test("fetchUser passes", async () => {
  const service = getAuthService(mockAuthAPI({ me }));
  expect(await service.fetchUser()).toBeUndefined();
  expect(service.user.value).toStrictEqual(mockUser);
});

test("fetchUser fails", async () => {
  async function me(): Promise<User> {
    throw buildAPIError(401, "");
  }
  const service = getAuthService(mockAuthAPI({ login, me }));
  await service.login(username, password);
  expect(await service.fetchUser()).toBeUndefined();
  expect(service.user.value).toBeUndefined();
  expect(token.value).toBeNull();
});
