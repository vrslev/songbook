<script setup lang="ts">
import { Field } from "vee-validate";

defineProps<{
  name: string;
  label: string;
  options: { label: string; value: string }[];
}>();
</script>

<template>
  <FieldArea :name="name" :label="label">
    <Field
      as="select"
      :name="name"
      :label="label"
      class="select select-bordered select-sm"
    >
      <option
        v-for="({ label, value }, idx) in [{ label: '', value: '' }].concat(
          options
        )"
        :key="idx"
        :value="value"
      >
        {{ label }}
      </option>
    </Field>
  </FieldArea>
</template>
