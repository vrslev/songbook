<script setup lang="ts">
import { useTitle } from "@vueuse/core";
import { useAuthService } from "./dependencies";
import { RouteNames, router } from "./router";
import { token } from "./services/auth";

const auth = useAuthService();

function fetchUserIfToken() {
  if (token.value) auth.fetchUser();
}

watch(token, fetchUserIfToken);
fetchUserIfToken();

const title = computed(() => {
  const to = router.currentRoute.value;
  if (!to.meta.noSetTitle && to.name && typeof to.name == "string")
    return to.name as RouteNames;
});
useTitle(title);
</script>

<template>
  <header class="grid w-full place-items-center">
    <div class="mt-9 p-5">
      <RouterLink
        class="text-ellipsis text-3xl font-bold text-base-content"
        to="/"
        >Сборник песен</RouterLink
      >
    </div>
  </header>

  <main class="mx-auto mb-3 max-w-3xl rounded-2xl">
    <div class="p-3 md:p-7">
      <Suspense>
        <RouterView />
      </Suspense>
    </div>
  </main>

  <template v-if="!$route.meta.hideFooter">
    <Suspense>
      <TheFooter />
    </Suspense>
  </template>
</template>
