import { ReadonlyArray2union } from "@domain.js/main/dist/types";

import type { TDeps } from "../../deps";
import { Profile } from "../../services/_schemas/profile-has-token";

export const Deps = ["aes", "signer", "errors", "Auth", "consts", "User"] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export function Main(cnf: any, deps: Deps) {
  const {
    signer: { generator },
    aes,
    errors,
    Auth,
    User,
    consts: { SIGN_AUTH_TIMESTAMP_MAX_GAP_MS },
  } = deps;

  return async ({
    type,
    token,
    sign,
    realIp,
  }: Pick<Profile, "type" | "token" | "sign" | "realIp">) => {
    if (token) {
      const _type = token.slice(0, 4);
      if (_type === "user") return Auth.readUserByToken(token);
      return Auth.readSessionFromCache(token);
    }

    throw errors.noAuth();
  };
}
