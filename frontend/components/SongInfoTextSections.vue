<script setup lang="ts">
defineProps<{ sections: { name: string; rows: string[] }[] }>();
</script>

<template>
  <article
    v-for="(section, section_idx) of sections"
    :key="section_idx"
    data-test="section"
  >
    <span />
    <h3 class="base-content-secondary" data-test="name">{{ section.name }}</h3>
    <div>
      <p
        v-for="(line, line_idx) of section.rows"
        :key="line_idx"
        data-test="row"
      >
        {{ line }}
      </p>
    </div>
  </article>
</template>
