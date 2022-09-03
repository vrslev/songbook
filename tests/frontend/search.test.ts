import { useSearch } from "@/search";
import { flushPromises } from "@vue/test-utils";

test("useSearch", async () => {
  interface Entry {
    name: string;
  }

  const data = ref<Entry[]>([{ name: "one" }, { name: "two" }]);
  const query = ref("one");
  const results = useSearch(query, data, { keys: ["name"] });

  async function expectResults(value: Entry[]) {
    await flushPromises();
    expect(results.value).toEqual(value);
  }

  await expectResults([{ name: "one" }]);

  query.value = "";
  await expectResults([]);

  query.value = "two";
  await expectResults([{ name: "two" }]);

  data.value.push({ name: "two o" });
  await expectResults([{ name: "two" }, { name: "two o" }]);
});
