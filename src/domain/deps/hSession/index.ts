import { ReadonlyArray2union } from "@domain.js/main/dist/types";
import { Cnf } from "../../../configs";
import type { TDeps } from "../../deps";

export const Deps = ["errors", "Auth"] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export function Main(cnf: Cnf, deps: Deps) {
  const { errors, Auth } = deps;

  return ({ token }: { token?: string }) => {
    if (token) return Auth.readUserByToken(token);

    throw errors.noAuth();
  };
}
