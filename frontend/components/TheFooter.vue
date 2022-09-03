<script setup lang="ts">
import { useAuthService } from "@/dependencies";
import { redirectToLogin } from "@/router";
import {
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon,
} from "@heroicons/vue/20/solid";

const auth = useAuthService();
</script>

<template>
  <footer
    class="relative bottom-0 grid grid-flow-col place-items-center items-start pb-5"
  >
    <div class="grid grid-flow-col place-content-center gap-7">
      <template v-if="auth.user.value">
        <div class="text-sm font-semibold" data-test="username">
          {{ auth.user.value.username }}
        </div>
        <button class="footer-btn" @click="auth.logout" data-test="logout">
          <ArrowLeftOnRectangleIcon class="icon" />
          <span>Выйти</span>
        </button>
        <RouterLink
          v-if="auth.user.value.is_superuser"
          to="/users"
          class="footer-btn"
          data-test="users-btn"
        >
          <UserGroupIcon class="icon" />
          <span>Пользователи</span>
        </RouterLink>
      </template>
      <button
        v-else
        class="footer-btn"
        @click="redirectToLogin"
        data-test="login"
      >
        <ArrowRightOnRectangleIcon class="icon" />
        <span>Войти</span>
      </button>
    </div>
  </footer>
</template>

<style scoped>
.footer-btn {
  @apply grid grid-flow-col items-center gap-1 text-sm;
}
</style>
