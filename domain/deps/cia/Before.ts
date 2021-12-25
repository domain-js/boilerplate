import { Defines } from "./defines";
import type { Deps } from ".";

export function Before(cnf: any, deps: Deps) {
  return [cnf, deps, Defines(cnf, deps)];
}
