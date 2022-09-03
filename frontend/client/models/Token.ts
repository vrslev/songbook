/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Token = {
  access_token: string;
  token_type: Token.token_type;
};

export namespace Token {
  export enum token_type {
    BEARER = "bearer",
  }
}
