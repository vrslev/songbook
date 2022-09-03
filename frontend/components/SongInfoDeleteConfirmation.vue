<script setup lang="ts">
import { vOnClickOutside } from "@vueuse/components";

defineProps<{ submit: () => unknown }>();

const open = ref(false);
const classes = computed(() => ({
  modal: true,
  "modal-open": open.value,
  "modal-middle": true,
}));
</script>

<template>
  <slot :open="() => (open = true)" />

  <Teleport to="body">
    <div :class="classes">
      <div
        class="h-30 modal-box modal-middle flex gap-2"
        v-on-click-outside="() => (open = false)"
      >
        <p class="flex-auto text-lg font-semibold">Вы уверены?</p>
        <button class="btn btn-sm" @click="submit" data-test="delete-yes-btn">
          Да
        </button>
      </div>
    </div>
  </Teleport>
</template>
