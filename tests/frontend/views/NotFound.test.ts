import NotFound from "@/views/NotFound.vue";
import { mount } from "@vue/test-utils";

test("NotFound", () => {
  const text = mount(NotFound).text();
  expect(text).toContain("Не найдено");
});
