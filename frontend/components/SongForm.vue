<script setup lang="ts">
import {
  ChordsSection,
  SongChords,
  SongTempo,
  type Song,
  type SongNoKey,
} from "@/client";
import { songSchema } from "@/core/validation";
import { sectionsTranslations } from "@/i18n";
import { ErrorMessage, Form, type SubmissionContext } from "vee-validate";

type ErrorString = string;
const props = defineProps<{
  song: Song | undefined;
  submit: (value: SongNoKey) => Promise<ErrorString | undefined>;
}>();

const sections = Object.values(ChordsSection.name).map((value) => ({
  label: sectionsTranslations[value],
  value,
}));

async function onSubmit(data: unknown, ctx: SubmissionContext) {
  const parsedData = await songSchema.validate(data);
  const errors = await props.submit(parsedData);
  if (errors) ctx.setErrors({ all: errors });
}

function resolveButtonClass(valid: boolean, isSubmitting: boolean) {
  if (!valid) return "btn-error";
  if (isSubmitting) return "loading";
  return "";
}
</script>

<template>
  <Form
    @submit="onSubmit"
    :validation-schema="songSchema"
    :initial-values="song"
    class="mx-auto grid max-w-full gap-10 rounded-2xl bg-base-100 p-5 pt-6 md:p-10"
    v-slot="{ meta: { valid }, isSubmitting }"
  >
    <FormSection title="Детали">
      <div class="col-2">
        <TextField name="name" label="Название" />
        <TextField name="original_name" label="Оригинальное название" />
      </div>
      <TextField name="artist" label="Исполнитель" />
      <div class="col-2">
        <TextField name="links.apple_music" label="Apple Music" />
        <TextField name="links.youtube" label="YouTube" />
      </div>
    </FormSection>
    <FormSection title="Темп">
      <div class="col-2">
        <TextField name="tempo.bpm" label="BPM" />
        <SelectField
          name="tempo.time_signature"
          label="Тактовый размер"
          :options="
            Object.values(SongTempo.time_signature).map((value) => ({
              label: value,
              value,
            }))
          "
        />
      </div>
    </FormSection>
    <FormSection title="Аккорды">
      <SelectField
        name="chords.key"
        label="Тональность"
        :options="
          Object.values(SongChords.key).map((value) => ({
            label: value,
            value,
          }))
        "
      />
      <DynamicFieldArray name="chords.sections" v-slot="{ idx }">
        <div class="col-3" data-test="chords">
          <SelectField
            :name="`chords.sections[${idx}].name`"
            label="Часть"
            :options="sections"
          />
          <TextareaField
            :name="`chords.sections[${idx}].notes`"
            label="Ноты"
            class="col-span-2"
            rows="2"
          />
        </div>
      </DynamicFieldArray>
    </FormSection>
    <FormSection title="Слова">
      <DynamicFieldArray name="lyrics" v-slot="{ idx }">
        <div class="col-3" data-test="lyrics">
          <SelectField
            :name="`lyrics[${idx}].name`"
            label="Часть"
            :options="sections"
          />
          <TextareaField
            :name="`lyrics[${idx}].text`"
            label="Текст"
            class="col-span-2"
            rows="4"
          />
        </div>
      </DynamicFieldArray>
    </FormSection>
    <div class="grid place-items-center gap-2">
      <button :class="`btn ${resolveButtonClass(valid, isSubmitting)}`">
        Сохранить
      </button>
      <ErrorMessage
        name="all"
        class="error-message"
        data-test="error-message"
      />
    </div>
  </Form>
</template>

<style scoped>
.col-2 {
  @apply grid grid-cols-2 gap-3;
}

.col-3 {
  @apply grid grid-cols-3 gap-3;
}
</style>
