<script setup lang="ts">
import { Field } from "vee-validate";

defineProps<{ name: string; label: string; type?: string }>();
</script>

<template>
  <FieldArea :name="name" :label="label">
    <Field
      :type="type || 'text'"
      :name="name"
      :label="label"
      class="input input-bordered input-sm"
    />
  </FieldArea>
</template>
