import * as Table from "text-table";
import type { TDeps } from "../../deps";
import { Deps } from "./Deps";

export { Before } from "./Before";

type Define = Parameters<TDeps["myCia"]["regist"]>;

export function Main(cnf: any, deps: Deps, defines: Define[]) {
  const {
    _,
    graceful,
    logger,
    consts: { MODELS },
    myCia,
  } = deps;

  const modelNames = new Set<string>(MODELS);

  console.log("defines", defines);
  for (const [name, ...rest] of defines) {
    if (name.startsWith("domain.")) myCia.domainPaths.add(name);
    if (modelNames.has(name.split(".")[0])) myCia.modelHooks.add(name);
    console.log(name, ...rest);
    myCia.regist(name, ...rest);
  }

  const head = ["Name", "P, D, DN, E", "Types(P, D, DN, E);"];
  const printStats = () => {
    const stats = myCia.getStats();
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
    logger.info(`System exiting, myCia stats:\n${table}`);
  };

  graceful.exit(printStats);

  return myCia;
}
