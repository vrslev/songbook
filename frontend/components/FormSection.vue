<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <section class="grid gap-3">
    <div class="text-xl font-semibold">
      <h1 data-test="title">{{ title }}</h1>
    </div>
    <div class="grid gap-2" data-test="slot"><slot /></div>
  </section>
</template>
