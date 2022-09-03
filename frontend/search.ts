import Fuse from "fuse.js";
import type { Ref } from "vue";

export function useSearch<T>(
  query: Ref<string>,
  data: Ref<T[]>,
  options: Fuse.IFuseOptions<T>
): Ref<T[]> {
  function updateEngine(data: T[]): void {
    engine = new Fuse(data, options);
  }

  function updateResult(query: string): void {
    result.value = engine.search(query).map((entry) => entry.item);
  }

  let engine: Fuse<T>;
  const result: Ref<T[]> = ref([]);

  watch(
    data,
    (value) => {
      updateEngine(value);
      updateResult(query.value);
    },
    { deep: true }
  );

  watch(query, (value) => {
    updateResult(value);
  });

  updateEngine(data.value);
  updateResult(query.value);

  return result;
}
