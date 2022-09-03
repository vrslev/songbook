import { handlingAuthErrors, isAuthError } from "@/services/utils";
import { buildAPIError } from "../utils";

describe("isAuthError", () => {
  test("true", () => {
    expect(isAuthError(buildAPIError(401, ""))).toBe(true);
  });

  test.each([buildAPIError(500, ""), new Error()])("false", (e) => {
    expect(isAuthError(e)).toBe(false);
  });
});

describe("handlingAuthErrors", () => {
  test("passes", async () => {
    const result = await handlingAuthErrors(
      async () => "ok",
      /* c8 ignore next 2 */
      () => undefined
    );
    expect(result).toStrictEqual({ value: "ok" });
  });

  const errorMessage = "my error message";
  const getThrowAPIError = (status: number) => () => {
    throw buildAPIError(status, errorMessage);
  };

  test("fails with 401", async () => {
    const handler = vi.fn();
    const result = await handlingAuthErrors(getThrowAPIError(401), handler);
    expect(result).toBeUndefined();
    expect(handler).toHaveBeenCalledOnce();
  });

  test("fails with other status", async () => {
    const handler = vi.fn();
    const promise = handlingAuthErrors(getThrowAPIError(500), handler);
    expect(promise).rejects.toThrow(errorMessage);
    expect(handler).toBeCalledTimes(0);
  });

  class CustomError extends Error {}

  test.each([Error, CustomError])("fails with other error", async (cls) => {
    const error = new cls();
    const func = () => {
      throw error;
    };
    const handler = vi.fn();
    const promise = handlingAuthErrors(func, handler);

    expect(promise).rejects.toThrow(error);
    expect(handler).toBeCalledTimes(0);
  });
});
