import TextareaField from "@/components/TextareaField.vue";
import { mount, VueWrapper } from "@vue/test-utils";
import { fieldAreaRendered, fieldRendered } from "../utils";

const name = "my name";
const label = "my label";

let wrapper: VueWrapper;
beforeAll(() => {
  wrapper = mount(TextareaField, {
    props: { name, label, rows: "5" },
  });
});

test("area", () => fieldAreaRendered(wrapper, name, label));

test("field", () => {
  fieldRendered(wrapper, { as: "textarea", name, label });
  expect(wrapper.get("textarea").attributes().rows).toBe("5");
});
