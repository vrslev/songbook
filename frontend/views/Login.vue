<script setup lang="ts">
import { ApiError } from "@/client";
import { userSchema } from "@/core/validation";
import { useAuthService } from "@/dependencies";
import { router } from "@/router";
import { token } from "@/services/auth";
import { isAuthError } from "@/services/utils";
import { ErrorMessage, Form, type SubmissionContext } from "vee-validate";
import type { LocationQuery } from "vue-router";

if (token.value) router.push("/");

const auth = useAuthService();

const getRedirectParam = (q: LocationQuery) =>
  typeof q.redirect == "string" ? q.redirect : "/";

function resolveErrorMessage(e: ApiError) {
  return isAuthError(e) ? "Неверный логин или пароль" : "Что-то пошло не так";
}

async function submit(data: unknown, ctx: SubmissionContext): Promise<void> {
  const data_ = data as typeof userSchema.__outputType;

  try {
    await auth.login(data_.username, data_.password);
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
    ctx.setErrors({ all: resolveErrorMessage(e) });
    return;
  }

  await router.push(getRedirectParam(router.currentRoute.value.query));
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-lg items-center">
    <Form
      @submit="submit"
      :validation-schema="userSchema"
      class="grid place-items-center gap-4 rounded-2xl bg-base-100 p-10 px-16"
    >
      <h1 class="text-xl font-semibold" data-test="title">Вход</h1>
      <div class="grid gap-2">
        <TextField name="username" label="Логин" data-test="username" />
        <TextField
          name="password"
          label="Пароль"
          type="password"
          data-test="password"
        />
      </div>
      <div class="grid place-items-center gap-2 pt-5">
        <button class="btn" data-test="login-btn">Войти</button>
        <ErrorMessage
          name="all"
          class="error-message"
          data-test="error-message"
        />
      </div>
    </Form>
  </div>
</template>
