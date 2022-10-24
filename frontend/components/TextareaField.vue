<script setup lang="ts">
import { Field } from "vee-validate";

defineProps<{ name: string; label: string; rows: string }>();
</script>

<template>
  <FieldArea :name="name" :label="label">
    <Field
      as="textarea"
      :name="name"
      :label="label"
      :rows="rows"
      class="textarea-bordered textarea text-sm"
    />
  </FieldArea>
</template>
