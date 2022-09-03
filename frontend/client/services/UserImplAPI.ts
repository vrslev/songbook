/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from "../models/User";
import type { UserAdd } from "../models/UserAdd";
import type { UserUpdatePasswordBody } from "../models/UserUpdatePasswordBody";

import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";

export class UserImplAPI {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * All
   * @returns User Successful Response
   * @throws ApiError
   */
  public userAll(): CancelablePromise<Array<User>> {
    return this.httpRequest.request({
      method: "GET",
      url: "/user/",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
      },
    });
  }

  /**
   * Add
   * @param requestBody
   * @returns User Successful Response
   * @throws ApiError
   */
  public userAdd(requestBody: UserAdd): CancelablePromise<User> {
    return this.httpRequest.request({
      method: "POST",
      url: "/user",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        409: `Conflict`,
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete
   * @param username
   * @returns void
   * @throws ApiError
   */
  public userDelete(username: string): CancelablePromise<void> {
    return this.httpRequest.request({
      method: "DELETE",
      url: "/user/{username}",
      path: {
        username: username,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update Password
   * @param username
   * @param requestBody
   * @returns User Successful Response
   * @throws ApiError
   */
  public userUpdatePassword(
    username: string,
    requestBody: UserUpdatePasswordBody
  ): CancelablePromise<User> {
    return this.httpRequest.request({
      method: "PATCH",
      url: "/user/{username}",
      path: {
        username: username,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
    });
  }
}
