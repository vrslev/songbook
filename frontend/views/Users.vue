<script setup lang="ts">
import { useAuthService, useUserService } from "@/dependencies";
import { router } from "@/router";

const auth = useAuthService();
const users = useUserService();

if (auth.user.value) await users.fetch();
else router.push("/");
</script>

<template>
  <div class="grid gap-4">
    <UserListAdd :add-user="users.add" />
    <div class="grid items-center divide-y divide-base-300">
      <template v-for="user in users.all.value" :key="user.username">
        <UserListItem
          :user="user"
          :updatePassword="users.updatePassword"
          :delete-user="users.delete"
        />
      </template>
    </div>
  </div>
</template>
