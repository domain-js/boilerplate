import { Defines } from "./defines";
import { Deps } from "./Deps";

export function Before(cnf: any, deps: Pick<Deps, "consts" | "_">) {
  return [cnf, deps, Defines(cnf, deps)];
}
