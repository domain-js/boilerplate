import type { Cnf } from "../../../configs";
import type { TDeps } from "../../deps";
import type { Main } from ".";

type Deps = Pick<TDeps, "cia" | "graceful" | "parallel">;
type TModel = ReturnType<typeof Main>;
type Id = number | string;

export function After(...args: any[]) {
  const online = args[0] as TModel;
  const cnf = args[1] as Cnf;
  const deps = args[2] as Deps;

  const { graceful, parallel, cia } = deps;

  for (const x of ["online", "offline"] as const) {
    online[x] = graceful.runnerAsync(online[x]);
  }

  // 进程退出时候的处理
  graceful.exit(online.onExit);

  cia.link("online", "publish2redis", async (id: Id) => {
    const status = await online.online(id);
    if (status) cia.submit("global-online", id);
  });

  cia.link("offline", "publish2redis", async (id: Id) => {
    const status = await online.offline(id);
    if (status) cia.submit("global-offline", id);
  });
}
