<script setup lang="ts">
import type { User } from "@/client";
import type { UserService } from "@/services/user";
import { KeyIcon, TrashIcon } from "@heroicons/vue/20/solid";
import { vOnClickOutside } from "@vueuse/components";
import { ErrorMessage, Form, type SubmissionContext } from "vee-validate";
import { object, ref as yupRef, string } from "yup";

const props = defineProps<{
  user: User;
  updatePassword: UserService["updatePassword"];
  deleteUser: UserService["delete"];
}>();

const open = ref(false);
const updatingPassword = ref(false);

const classes = computed(() => ({
  modal: true,
  "modal-open": open.value,
  "modal-bottom": true,
  "sm:modal-middle": true,
}));

const updatePasswordSchema = object({
  newPassword: string().required().label("New password"),
  confirmation: string()
    .when("newPassword", {
      is: (newPassword: string | undefined) => newPassword?.length,
      then: string()
        .required()
        .oneOf([yupRef("newPassword")], "Passwords must match"),
    })
    .label("Confirmation"),
});

async function onUpdatePassword(data: unknown, ctx: SubmissionContext) {
  const validated = await updatePasswordSchema.validate(data);
  const result = await props.updatePassword(
    props.user.username,
    validated.newPassword
  );
  if (!result) {
    ctx.setErrors({ all: "Что-то пошло не так" });
    return;
  }
  ctx.setValues({});
  open.value = false;
  updatingPassword.value = false;
}
</script>

<template>
  <button
    @click="open = true"
    class="bg-base-100 p-3 px-7 text-left first:rounded-t-xl first:pt-4 last:rounded-b-xl last:pb-4 hover:bg-base-300"
  >
    {{ user.username }}
  </button>

  <Teleport to="body">
    <div :class="classes">
      <div
        class="modal-box relative grid gap-2"
        v-on-click-outside="() => (open = false)"
      >
        <div class="flex items-start gap-2 p-2">
          <h1 class="text-2xl font-bold">{{ user.username }}</h1>
          <span class="badge-outline badge" v-if="user.is_superuser">
            суперюзер
          </span>
        </div>
        <Form
          v-if="updatingPassword"
          :validation-schema="updatePasswordSchema"
          @submit="onUpdatePassword"
          class="grid gap-5"
        >
          <div class="grid gap-2">
            <TextField
              name="newPassword"
              label="Новый пароль"
              type="password"
            />
            <TextField
              name="confirmation"
              label="Подтверждение"
              type="password"
            />
            <ErrorMessage name="all" class="error-message" />
          </div>
          <div class="grid grid-flow-col gap-2">
            <button class="button">Сохранить</button>
            <button class="button-outline" @click="updatingPassword = false">
              Отменить
            </button>
          </div>
        </Form>
        <div v-else class="grid grid-flow-col gap-2">
          <button class="button-outline" @click="updatingPassword = true">
            <KeyIcon class="icon" />
            Обновить пароль
          </button>
          <button class="button-outline" @click="deleteUser(user.username)">
            <TrashIcon class="icon" />
            Удалить
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.button {
  @apply btn flex-nowrap gap-2;
}
.button-outline {
  @apply btn-outline btn flex-nowrap gap-2;
}
</style>
