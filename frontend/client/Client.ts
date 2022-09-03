/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from "./core/BaseHttpRequest";
import type { OpenAPIConfig } from "./core/OpenAPI";
import { AxiosHttpRequest } from "./core/AxiosHttpRequest";

import { AuthImplAPI } from "./services/AuthImplAPI";
import { SongImplAPI } from "./services/SongImplAPI";
import { UserImplAPI } from "./services/UserImplAPI";

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class Client {
  public readonly auth: AuthImplAPI;
  public readonly song: SongImplAPI;
  public readonly user: UserImplAPI;

  public readonly request: BaseHttpRequest;

  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = AxiosHttpRequest
  ) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? "",
      VERSION: config?.VERSION ?? "0.1.0",
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? "include",
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
    });

    this.auth = new AuthImplAPI(this.request);
    this.song = new SongImplAPI(this.request);
    this.user = new UserImplAPI(this.request);
  }
}
