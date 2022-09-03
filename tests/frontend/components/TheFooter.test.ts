import type { User } from "@/client";
import TheFooter from "@/components/TheFooter.vue";
import { authKey } from "@/dependencies";
import { router } from "@/router";
import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import type { Ref } from "vue";
import { mockAuthService, mockSuperuser, mockUser } from "../fixtures";

function factory(user: Ref<User | undefined>) {
  return mount(TheFooter, {
    global: {
      plugins: [router],
      provide: { [authKey]: mockAuthService({ user }) },
    },
  });
}

function checkLoggedIn(wrapper: VueWrapper) {
  expect(() => wrapper.getByTestId("login")).toThrow();
  expect(wrapper.getByTestId("logout").text()).toBe("Выйти");
  expect(wrapper.getByTestId("username").text()).toBe(mockUser.username);
}

function checkLoggedOut(wrapper: VueWrapper) {
  expect(() => wrapper.getByTestId("logout")).toThrow();
  expect(wrapper.getByTestId("login").text()).toBe("Войти");
}

function checkIsSuperuser(wrapper: VueWrapper) {
  const btn = wrapper.getByTestId("users-btn");
  expect(btn.text()).toBe("Пользователи");
  expect(btn.attributes().href).toBe("/users");
}

function checkNotSuperuser(wrapper: VueWrapper) {
  expect(() => wrapper.getByTestId("users-btn")).toThrow();
}

test("logged in", () => {
  checkLoggedIn(factory(ref(mockUser)));
});

test("not logged in", () => {
  checkLoggedOut(factory(ref(undefined)));
});

test("is superuser", () => {
  checkIsSuperuser(factory(ref(mockSuperuser)));
});

test.each([mockUser, undefined])("not superuser", (value) => {
  checkNotSuperuser(factory(ref(value)));
});

test("is reactive", async () => {
  const user = ref<User | undefined>(undefined);
  const wrapper = factory(user);

  checkLoggedOut(wrapper);
  checkNotSuperuser(wrapper);

  user.value = mockUser;
  await flushPromises();
  checkLoggedIn(wrapper);
  checkNotSuperuser(wrapper);

  user.value.is_superuser = true;
  await flushPromises();
  checkIsSuperuser(wrapper);

  user.value = undefined;
  await flushPromises();
  checkLoggedOut(wrapper);
});
