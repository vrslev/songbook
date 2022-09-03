/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Song } from "../models/Song";
import type { SongNoKey } from "../models/SongNoKey";

import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";

export class SongImplAPI {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * All
   * @returns Song Successful Response
   * @throws ApiError
   */
  public songAll(): CancelablePromise<Array<Song>> {
    return this.httpRequest.request({
      method: "GET",
      url: "/song/",
    });
  }

  /**
   * Add
   * @param requestBody
   * @returns Song Successful Response
   * @throws ApiError
   */
  public songAdd(requestBody: SongNoKey): CancelablePromise<Song> {
    return this.httpRequest.request({
      method: "POST",
      url: "/song",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        401: `Unauthorized`,
        409: `Conflict`,
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete
   * @param key
   * @returns void
   * @throws ApiError
   */
  public songDelete(key: string): CancelablePromise<void> {
    return this.httpRequest.request({
      method: "DELETE",
      url: "/song/{key}",
      path: {
        key: key,
      },
      errors: {
        401: `Unauthorized`,
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update
   * @param key
   * @param requestBody
   * @returns Song Successful Response
   * @throws ApiError
   */
  public songUpdate(
    key: string,
    requestBody: SongNoKey
  ): CancelablePromise<Song> {
    return this.httpRequest.request({
      method: "PATCH",
      url: "/song/{key}",
      path: {
        key: key,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        401: `Unauthorized`,
        404: `Not Found`,
        422: `Validation Error`,
      },
    });
  }
}
