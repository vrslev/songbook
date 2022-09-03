<script setup lang="ts">
import { ErrorMessage } from "vee-validate";
defineProps<{ name: string; label: string }>();
</script>

<template>
  <div class="form-control">
    <label :for="name" class="label">{{ label }}</label>
    <slot />
    <ErrorMessage
      :name="name"
      class="error-message"
      data-test="error-message"
    />
  </div>
</template>
