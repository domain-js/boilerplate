import { ReadonlyArray2union } from "@domain.js/main/dist/types";
import { Cnf } from "../../configs";
import type { TDeps } from "../../deps";

export const Deps = ["Auth"] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export function Main(cnf: Cnf, deps: Deps) {
  const { Auth } = deps;

  return ({ token }) => {
    if (token) return Auth.readUserByToken(token);

    return null;
  };
}
