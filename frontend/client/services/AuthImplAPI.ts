/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_auth_login } from "../models/Body_auth_login";
import type { Token } from "../models/Token";
import type { User } from "../models/User";

import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";

export class AuthImplAPI {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Login
   * @param formData
   * @returns Token Successful Response
   * @throws ApiError
   */
  public authLogin(formData: Body_auth_login): CancelablePromise<Token> {
    return this.httpRequest.request({
      method: "POST",
      url: "/auth/login",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        401: `Unauthorized`,
        422: `Validation Error`,
      },
    });
  }

  /**
   * Me
   * @returns User Successful Response
   * @throws ApiError
   */
  public authMe(): CancelablePromise<User> {
    return this.httpRequest.request({
      method: "GET",
      url: "/auth/me",
      errors: {
        401: `Unauthorized`,
      },
    });
  }
}
