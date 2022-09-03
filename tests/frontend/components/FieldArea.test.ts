import FieldArea from "@/components/FieldArea.vue";
import { mount } from "@vue/test-utils";
import { Field, Form } from "vee-validate";

const name = "field_name";
const label = "My label";

function factory(initialErrors?: { [K: string]: string }) {
  const template = `
    <Form :initial-errors="initialErrors">
      <FieldArea :name="name" :label="label">
        <Field :name="name" />
      </FieldArea>
    </Form>
  `;
  const component = defineComponent({
    template,
    components: { FieldArea, Form, Field },
    data: () => ({ name, label, initialErrors }),
  });
  return mount(component);
}

test("label", () => {
  const element = factory().get("label");
  expect(element.text()).toBe(label);
  expect(element.attributes().for).toBe(name);
});

test("field", () => {
  factory().getComponent(Field);
});

test("error message", () => {
  const error = "my error";
  const element = factory({ [name]: error }).getByTestId("error-message");
  expect(element.text()).toBe(error);
});
