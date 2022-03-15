import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";
import * as fs from "fs";
import * as path from "path";
import Table = require("text-table");

import { Cnf } from "../../../configs";
import type { TDeps } from "../../deps";

export const Deps = ["_", "logger", "cron", "graceful", "parallel"] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export function Main(cnf: Cnf, deps: Deps) {
  const { mode } = cnf;
  const { _, logger, cron, graceful, parallel } = deps;

  const defines = fs
    .readFileSync(path.resolve(__dirname, "./crons.csv"))
    .toString()
    .trim()
    .split("\n")
    .map((x) =>
      x
        .trim()
        .split(",")
        .map((s) => s.trim()),
    );

  for (let i = 1; i < defines.length; i += 1) {
    const [name, interval, startAt] = defines[i];
    cron.regist(name, interval, startAt);
  }

  cron.start = parallel(cron.start, {
    path: "deps.cron.start",
    needWaitMS: 3 * 60 * 1000,
    neverReturn: true,
  });

  const head = ["Name", "Times", "Dones", "Failds", "TotalMS", "AvgMS"];
  const headKeys = ["name", "times", "dones", "failds", "totalMS", "avgMS"] as const;
  const align: ("l" | "r")[] = ["l", "r", "r", "r", "r", "r"];
  const printStats = () => {
    // 按照 失败次数 降序排列，这样最容易找到那些有问题的任务
    const data = _.sortBy(cron.getStats(), (x) => -x.failds);
    const list = [head].concat(
      data.map((x) => {
        if (x.avgMS === null) x.avgMS = 0;
        // 这里要让打印的字段穿对齐，因此 toFixed(4) 但是这样类型就变成 string 无法赋值给 number 了
        // 所以这里强制 as any
        x.avgMS = x.avgMS.toFixed(4) as any;
        return _.map(headKeys, (h) => _.toString(x[h]));
      }),
    );
    const table = Table(list, { align });
    logger.info(`System exiting cron exec stats\n${table}`);
  };

  if (mode === "auto") {
    // 在进程退出的时候答应计划任务执行的统计信息
    graceful.exit(printStats);

    process.nextTick(cron.start);
  }

  return cron;
}
