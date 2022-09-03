export {};

import "@vue/test-utils";
import "vitest";

declare module "@vue/test-utils" {
  class DOMWrapper {
    getByTestId: (selector: string) => Omit<DOMWrapper<Element>, "exists">;
  }
  class VueWrapper {
    getByTestId: (selector: string) => Omit<DOMWrapper<Element>, "exists">;
  }
}

declare global {
  namespace Vi {
    interface Assertion {
      toHaveCalls(...calls: unknown[]): void;
    }
  }
}
