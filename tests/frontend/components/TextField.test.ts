import TextField from "@/components/TextField.vue";
import { mount } from "@vue/test-utils";
import { fieldAreaRendered } from "../utils";

const name = "my name";
const label = "my label";

function factory(type?: string) {
  return mount(TextField, { props: { name, label, type } });
}

test("area", () => {
  fieldAreaRendered(factory(), name, label);
});

test.each([
  [undefined, "text"],
  ["password", "password"],
])("field type", (input_type, output_type) => {
  const input = factory(input_type).get("input");
  expect(input.attributes().type).toBe(output_type);
});
