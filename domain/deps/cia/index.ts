import * as Table from "text-table";
import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";
import type { TDeps } from "../../deps";

export { Before } from "./Before";

export const Deps = ["_", "logger", "graceful", "consts", "schema", "cia"] as const;

export type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

type Define = Parameters<TDeps["cia"]["regist"]>;

export function Main(cnf: any, deps: Deps, defines: Define[]) {
  const {
    _,
    graceful,
    logger,
    consts: { MODELS },
    cia,
  } = deps;

  const modelNames = new Set<string>(MODELS);

  for (const [name, ...rest] of defines) {
    if (name.startsWith("domain.")) cia.domainPaths.add(name);
    if (modelNames.has(name.split(".")[0])) cia.modelHooks.add(name);
    cia.regist(name, ...rest);
  }

  const head = ["Name", "P, D, DN, E", "Types(P, D, DN, E);"];
  const printStats = () => {
    const stats = cia.getStats();
    const list = [head];
    const data = _.chain(stats)
      .map((obj, name) => Object.assign(obj, { name }))
      .sortBy((x) => -x.errors)
      .value();
    for (const item of data) {
      const { name, pendings, doings, dones, errors, _types } = item;
      list.push([
        name,
        [pendings, doings, dones, errors].join(", "),
        _types
          .map((x) => [`${x.type}(${x.pendings}, ${x.doings}, ${x.dones}, ${x.errors})`])
          .join("; "),
      ]);
    }
    const table = Table(list);
    logger.info(`System exiting, cia stats:\n${table}`);
  };

  graceful.exit(printStats);

  return cia;
}
