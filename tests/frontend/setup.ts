import { config, DOMWrapper, VueWrapper } from "@vue/test-utils";
import initChordChart from "chord-chart-wasm";
import { beforeAll } from "vitest";

function dataTestPlugin(wrapper: DOMWrapper<Node> | VueWrapper) {
  function getByTestId(selector: string): Omit<DOMWrapper<Element>, "exists"> {
    return wrapper.get(`[data-test='${selector}']`);
  }

  return { getByTestId };
}

expect.extend({
  toHaveCalls(received, ...expected: unknown[][]) {
    expect(received).toHaveBeenCalledTimes(expected.length);
    expected.forEach((value, index) =>
      expect(received).toHaveBeenNthCalledWith(index + 1, ...value)
    );
    return { pass: true, message: () => "" };
  },
});

beforeAll(async () => {
  config.plugins.VueWrapper.install(dataTestPlugin);
  config.plugins.DOMWrapper.install(dataTestPlugin);
  await initChordChart();
});
