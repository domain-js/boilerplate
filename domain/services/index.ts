import { Cnf } from "../configs";
import { deps } from "../deps";

type Deps = typeof deps;

export function Services(cnf: Cnf, deps: Deps) {
  return {
    home() {
      return "hello world";
    },
  };
}
