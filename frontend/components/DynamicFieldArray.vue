<script setup lang="ts">
import { useFieldArray } from "vee-validate";

function onInput() {
  const values = fields.value.map((el) => el.value);
  removeUnusedEntries(
    iterateReverseIndexes(values),
    getLastNotEmptyRow(values)
  );
}

function removeUnusedEntries(
  valueIter: Generator<number>,
  lastNotEmptyRow?: number
) {
  if (lastNotEmptyRow == undefined) {
    for (const index of valueIter) remove(index);
  } else {
    for (const index of valueIter) if (index > lastNotEmptyRow) remove(index);
  }

  push({});
}

function* iterateReverseIndexes<T>(array: T[]): Generator<number> {
  for (const idx of Object.keys(array).reverse()) {
    yield Number(idx);
  }
}

function getLastNotEmptyRow<T>(array: T[]): number | undefined {
  for (const entry of Object.values(array).reverse())
    if (entry)
      for (const value of Object.values(entry))
        if (value) return array.indexOf(entry);
}

const props = defineProps<{ name: string }>();
const { push, remove, fields } = useFieldArray(props.name);
onInput();
</script>

<template>
  <fieldset v-for="(field, idx) in fields" :key="field.key" @input="onInput">
    <slot :idx="idx" />
  </fieldset>
</template>
