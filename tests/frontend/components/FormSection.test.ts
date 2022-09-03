import FormSection from "@/components/FormSection.vue";
import { mount, VueWrapper } from "@vue/test-utils";

let wrapper: VueWrapper;
beforeAll(() => {
  const template = `<FormSection title="hello">world</FormSection>`;
  wrapper = mount(defineComponent({ template, components: { FormSection } }));
});

test("title", () => {
  expect(wrapper.getByTestId("title").text()).toBe("hello");
});

test("slot", () => {
  expect(wrapper.getByTestId("slot").text()).toBe("world");
});
