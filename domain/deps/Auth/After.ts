import type { TDeps } from "../../deps";
import type { Main } from "./Main";

type Deps = Pick<TDeps, "cia" | "cache" | "consts">;
type TModel = ReturnType<typeof Main>;

export function After(...args: any[]) {
  const Model = args[0] as TModel;
  const deps = args[2] as Deps;

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