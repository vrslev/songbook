import SelectField from "@/components/SelectField.vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { fieldAreaRendered, fieldRendered } from "../utils";

const name = "my_name";
const label = "my label";
const options = [
  { label: "First", value: "first" },
  { label: "Second", value: "second" },
  { label: "Third", value: "third" },
];

let wrapper: VueWrapper;
beforeAll(() => {
  wrapper = mount(SelectField, { props: { name, label, options } });
});

test("area", () => {
  fieldAreaRendered(wrapper, name, label);
});

test("field", () => {
  fieldRendered(wrapper, { as: "select", name, label });
});

test("options", () => {
  const elements = wrapper.findAll("option");
  const labels = elements.map((el) => el.text());
  expect(labels).toEqual(["", ...options.map((value) => value.label)]);
  const values = elements.map((el) => el.element.value);
  expect(values).toEqual(["", ...options.map((value) => value.value)]);
});
