import { deps } from "../../deps";
import type { Main } from "./Main";

type Deps = Pick<typeof deps, "cia" | "cache" | "consts">;

type Model = ReturnType<typeof Main>;

export function After(Model: Model, cnf: any, deps: Deps) {
  const {
    cia,
    cache,
    consts: {
      CACHE_LIFE_MS: { AUTH_READ_USER_BY_TOKEN },
    },
  } = deps;

  const cacheKeyFn = (token: string) => `LoginToken: ${token}`;

  Model.readUserByToken = cache.caching(
    Model.readUserByToken.bind(Model),
    AUTH_READ_USER_BY_TOKEN,
    cacheKeyFn,
  );

  cia.link("Auth.afterDestroy", "cleanCache", ([{ token }]) => cache.del(cacheKeyFn(token)));
}
