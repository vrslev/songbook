import { authKey } from "@/dependencies";
import { router } from "@/router";
import { token, type AuthService } from "@/services/auth";
import Login from "@/views/Login.vue";
import { mount, VueWrapper } from "@vue/test-utils";
import { mockAuthService, mockToken } from "../fixtures";
import { buildAPIError, waitForVeeValidate } from "../utils";

const username = "lev";
const password = "pwd";

function factory(login?: AuthService["login"]) {
  return mount(Login, {
    global: {
      plugins: [router],
      provide: { [authKey]: mockAuthService({ login }) },
    },
  });
}

async function submitForm(
  wrapper: VueWrapper,
  username: unknown,
  password: unknown
) {
  await wrapper.getByTestId("username").get("input").setValue(username);
  await wrapper.getByTestId("password").get("input").setValue(password);
  await wrapper.getByTestId("login-btn").trigger("submit");
  await waitForVeeValidate();
}

beforeAll(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  token.value = null;
});

it("renders title", () => {
  const text = factory().getByTestId("title").text();
  expect(text).toBe("Вход");
});

it("redirects if token already in store", () => {
  const push = vi.spyOn(router, "push");
  token.value = mockToken;
  factory();
  expect(push).toHaveCalls(["/"]);
});

it("doesn't redirect if token not in store", () => {
  const push = vi.spyOn(router, "push");
  factory();
  expect(push).toBeCalledTimes(0);
});

test.each([
  [true, false],
  [false, true],
  [true, true],
])("validation works", async (noUsername, noPassword) => {
  const wrapper = factory();
  await submitForm(
    wrapper,
    noUsername ? "" : username,
    noPassword ? "" : password
  );

  function checkErrorMessage(id: string, hasMessage: boolean) {
    const el = wrapper.getByTestId(id);
    const getMessage = () => el.getByTestId("error-message");
    if (hasMessage) expect(getMessage().text()).toBeTruthy();
    else expect(getMessage).toThrow();
  }

  checkErrorMessage("username", noUsername);
  checkErrorMessage("password", noPassword);
});

it("passes", async () => {
  const login = vi.fn();
  const wrapper = factory(login);

  await submitForm(wrapper, username, password);
  expect(() => wrapper.getByTestId("error-message")).toThrow();
  expect(login).toHaveCalls([username, password]);
});

it.each([
  [undefined, "/"],
  ["", ""],
  ["/there", "/there"],
  [["/here", "/there"], "/"],
])("redirects after submission", async (param, url) => {
  const wrapper = factory(async () => undefined);
  const push = vi.spyOn(router, "push");

  router.replace({ query: { redirect: param } });
  await submitForm(wrapper, username, password);
  expect(push).toHaveCalls([url]);
});

it.each([
  [401, "Неверный логин или пароль"],
  [500, "Что-то пошло не так"],
])("fails", async (status, message) => {
  const wrapper = factory(async () => {
    throw buildAPIError(status, "");
  });

  await submitForm(wrapper, username, password);
  expect(wrapper.getByTestId("error-message").text()).toBe(message);
});
