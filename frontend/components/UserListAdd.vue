<script setup lang="ts">
import { ApiError } from "@/client";
import { userSchema } from "@/core/validation";
import type { UserService } from "@/services/user";
import { PlusIcon } from "@heroicons/vue/20/solid";
import { vOnClickOutside } from "@vueuse/components";
import { ErrorMessage, Form, type SubmissionContext } from "vee-validate";

const props = defineProps<{ addUser: UserService["add"] }>();

const open = ref(false);
const classes = computed(() => ({
  modal: true,
  "modal-open": open.value,
  "modal-bottom": true,
  "sm:modal-middle": true,
}));

async function submit(data: unknown, ctx: SubmissionContext) {
  const validated = await userSchema.validate(data);

  let message = "Что-то пошло не так";
  let result = undefined;

  try {
    result = await props.addUser(validated);
  } catch (e) {
    if (e instanceof ApiError && e.status == 409)
      message = "Пользователь с таким логином уже существует";
  }

  if (result) {
    open.value = false;
    ctx.resetForm();
  } else {
    ctx.setErrors({ all: message });
  }
}
</script>

<template>
  <button class="btn" @click="open = true">
    <PlusIcon class="icon" />
  </button>

  <Teleport to="body">
    <div :class="classes">
      <div
        class="modal-box relative grid gap-2"
        v-on-click-outside="() => (open = false)"
      >
        <div class="grid items-center gap-4 p-2">
          <h1 class="text-center text-xl font-semibold">
            Добавить пользователя
          </h1>
          <Form
            :validation-schema="userSchema"
            @submit="submit"
            class="grid gap-5"
          >
            <div class="grid gap-2">
              <TextField name="username" label="Логин" />
              <TextField name="password" label="Пароль" type="password" />
            </div>
            <div class="grid gap-2">
              <button class="btn">Добавить</button>
              <ErrorMessage name="all" class="error-message" />
            </div>
          </Form>
        </div>
      </div>
    </div>
  </Teleport>
</template>
