import { ReadonlyArray2union } from "@domain.js/main/dist/types";
import Table = require("text-table");

import { MODELS } from "../../consts";
import { TDeps } from "../../deps";
import { Relations } from "./relations";

export const Deps = [
  "_",
  "async",
  "logger",
  "cache",
  "cia",
  "consts",
  "graceful",
  ...MODELS,
] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export function Main(cnf: any, deps: Deps) {
  // 注册默认hook
  const {
    _,
    cia,
    cache,
    logger,
    graceful,
    consts: {
      CACHE_LIFE_MS: { MODEL_GET_BY_PK },
    },
  } = deps;

  // 自定义的hook，将某些hook聚合成一种hook
  const defineHooks = {
    beforeChange: [
      "beforeCreate",
      "beforeDestroy",
      "beforeUpdate",
      "beforeBulkCreate",
      "beforeBulkDestroy",
      "beforeBulkUpdate",
    ],
    afterChange: [
      "afterCreate",
      "afterDestroy",
      "afterUpdate",
      "afterBulkCreate",
      "afterBulkDestroy",
      "afterBulkUpdate",
    ],
  };
  const Models = _.pick(deps, MODELS);

  for (const name of cia.modelHooks) {
    const [model, hook] = name.split(".") as [
      ReadonlyArray2union<typeof MODELS>,
      "beforeChange" | "afterChange",
    ];
    const Model = Models[model];
    if (defineHooks[hook]) {
      for (const h of defineHooks[hook]) {
        (Model as any).addHook(h, (instance: any, option: any) => {
          cia.submit(name, [instance, option]);
        });
      }
    } else {
      (Model as any).addHook(hook, (instance: any, option: any) => {
        cia.submit(name, [instance, option]);
      });
    }
  }

  const cacheHits: { [k: string]: { hits: number; misseds: number } } = {};
  const hitFn = (name: string) => {
    const stats = { hits: 0, misseds: 0 };
    cacheHits[name] = stats;
    return (hit: boolean) => {
      stats[hit ? "hits" : "misseds"] += 1;
    };
  };

  const getCacheKeyFn = (name: string) => (pk: string | number) => `${name}.getByPk-${pk}`;

  // 给特定的model添加getByPk, getByPks 方法，且 cache.caching 化
  for (const name of MODELS) {
    const Model = Models[name];
    const cacheKeyFn = getCacheKeyFn(name);
    const pkName = Model.primaryKeyAttributes ? Model.primaryKeyAttributes[0] : "id";
    // 这里之所以bind是为了 getByPk 内部的this正确
    Object.assign(Model, {
      getByPk: cache.caching(Model.getByPk.bind(Model), MODEL_GET_BY_PK, cacheKeyFn, hitFn(name)),
    });

    cia.link(`${name}.afterChange`, "cleanGetByPkCache", ([data]: [any]) => {
      cache.del(cacheKeyFn(data[pkName]));
    });
  }

  const head = ["Name", "Hits", "Misseds", "Hit rate"];
  const align: ("l" | "r")[] = ["l", "r", "r", "r"];
  const printCacheHitStats = () => {
    const list = [];
    for (const name of Object.keys(cacheHits)) {
      const { hits, misseds } = cacheHits[name];
      const total = hits + misseds;
      if (!total) continue; // 忽略没有执行过的
      const rate = hits / total;
      list.push([name, hits, misseds, rate.toFixed(6)]);
    }
    const table = Table(
      [head].concat((_ as any).sortBy(list, "3")).map((x) => x.map(_.toString)),
      { align },
    );

    logger.info(`System exiting Model.getByPk cache hit stats\n${table}`);
  };
  graceful.exit(printCacheHitStats);

  // 初始化models之间的关系
  Relations(Models);

  const getByPkCacheStats = () => cacheHits;

  return { getByPkCacheStats };
}
