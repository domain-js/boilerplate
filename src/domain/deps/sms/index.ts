import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";

import { TDeps } from "../../deps";
import type { Attrs as Demand } from "../Demand";

export const Deps = ["cia", "consts", "request", "async", "logger", "utils", "errors"] as const;

export function Main(cnf: any, deps: Pick<TDeps, ReadonlyArray2union<typeof Deps>>) {
  const { logger, cia } = deps;

  /**
   * 发送短信
   * @param to 接收的手机号码
   * @param body 发送的内容
   * @returns 短信服务商唯一任务ID
   */
  const send = async (to: string, body: string) => {
    // TODO 未来补齐
    logger.info("SMS.send", [to, body]);
    return "ok";
  };

  cia.link("Demand.afterCreate", "sendSMS", async ([demand]: [Demand]) => {
    await send(demand.to, demand.code);
  });

  return { send };
}
