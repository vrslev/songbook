import { ApiError } from "@/client";
import FieldArea from "@/components/FieldArea.vue";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import { Field } from "vee-validate";

/* c8 ignore start */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const justThrows: () => any = () => {
  throw new Error();
};
/* c8 ignore stop */

export const buildAPIError = (status: number, errorMessage: string) =>
  new ApiError(
    { method: "GET", url: "" },
    { body: "", ok: false, status, statusText: "", url: "" },
    errorMessage
  );

export function dataTestId(id: string): string {
  return `[data-test=${id}]`;
}

export function fieldAreaRendered(
  wrapper: VueWrapper,
  name: string,
  label: string
) {
  const props = wrapper.getComponent(FieldArea).props();
  expect(props.name).toBe(name);
  expect(props.label).toBe(label);
}

export function fieldRendered(
  wrapper: VueWrapper,
  props: { [K: string]: string }
) {
  const fieldProps = wrapper.getComponent(Field).props();
  for (const [key, value] of Object.entries(props)) {
    expect(fieldProps[key]).toBe(value);
  }
}

export async function waitForVeeValidate() {
  await flushPromises();
  vi.advanceTimersByTime(5);
  await flushPromises();
}
