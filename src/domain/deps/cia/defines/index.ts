import * as fs from "fs";
import * as path from "path";

import type { Deps } from "../Deps";

const simples = fs
  .readFileSync(path.resolve(__dirname, "simples.csv"))
  .toString()
  .trim()
  .split("\n")
  .map((x) => x.trim().split(","));

export function Defines(cnf: any, deps: Pick<Deps, "_" | "consts">) {
  const {
    _,
    consts: { MODELS },
  } = deps;
  const defines = [];

  // 将所有Model的cleanGetByPkCache加入defines中去
  // 注意 afterChange 是自定义的事件，合并了 afterUpdate, afterCreate, afterDestroy
  for (const name of MODELS) {
    simples.push([`${name}.afterChange`, "cleanGetByPkCache", "100"]);
  }

  // 加工处理 simples 格式的定义
  const grouped = _.groupBy(simples, "0");
  for (const name of Object.keys(grouped)) {
    defines.push([
      name, // 消息名称
      null, // 简单格式不对commit上来的数据格式做校验
      grouped[name].map(([, type, timeout]) => ({
        type,
        timeout: `${Number(timeout) | 0}`,
      })),
    ]);
  }

  return defines;
}
