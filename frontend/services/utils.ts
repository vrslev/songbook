import { ApiError } from "@/client";
import { redirectToLogin } from "@/router";

export interface SuccessfulResponse<T> {
  value: T;
}

export const isAuthError = (e: unknown) =>
  Boolean(e instanceof ApiError && e.status == 401);

export async function handlingAuthErrors<T>(
  func: () => Promise<T>,
  handler: () => unknown
): Promise<SuccessfulResponse<T> | undefined> {
  try {
    return { value: await func() };
  } catch (e) {
    if (isAuthError(e)) {
      handler();
    } else {
      throw e;
    }
  }
}

export function safe<T>(func: () => Promise<T>) {
  return handlingAuthErrors(func, redirectToLogin);
}
