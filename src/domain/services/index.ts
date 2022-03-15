import { Cnf } from "../../configs";
import { TDeps } from "../deps";
import { errors } from "../errors";
import output from "./_output";
import parallels from "./_parallels";
import defines from "./defines";

/** 领域方法所有的路径类型, 字符串联合类型 */
type Defines = typeof defines;
export type DomainPaths = keyof Defines;

/** 完整领域方法类型 */
type Services = {
  [k in DomainPaths]: {
    /** 领域方法第一个参数 profile 的 schema 定义 */
    profile: any;
    /** 领域方法第二个参数 params 的 schema 定义 */
    params: any;
    method: ReturnType<Defines[k]["Main"]>;
  };
};

export const Services = (cnf: Cnf, deps: TDeps) => {
  const { _, schema, graceful, cia } = deps;

  /** 加工领域方法函数 */
  const handle = (...handlers: ((...args: any) => any)[]) => {
    for (const path of Object.keys(defines) as DomainPaths[]) {
      const item = defines[path];
      const method = item.Main(cnf, deps);
      Object.assign(item, { method: handlers.reduce((m, h) => h(m, path), method) });
    }
  };

  // 检查 cia 是否已经准备好，如果没有，那说明有多余的regist，或者话句话说有缺失的link
  if (!cia.checkReady()) {
    console.log("cia lost link: %o", cia.getUnlinks());
    throw Error("CIA has not been ready");
  }

  // 自动执行cia相关的commit
  const autoCIA = (method: (...args: any[]) => any, path: string) => {
    const name = `domain.${path}`;
    if (!cia.domainPaths.has(name)) return method;
    return async (...args: any) => {
      const res = await method(...args);
      cia.submit(name, [args, res]);
      return res;
    };
  };

  // 自动记录 logging
  const logging = <T extends (...args: any[]) => any>(method: T, path: DomainPaths) =>
    deps.logger.logger(method, path, true);

  // 自动参数校验
  const validator = <T extends (...args: any[]) => any>(method: T, path: DomainPaths) => {
    const _schema: [any, any?] = [defines[path].profile];
    if (defines[path].params) _schema.push(defines[path].params);
    if (!_schema) return method;
    return schema.auto(method, _schema, errors.domainMethodCallArgsInvalid, path);
  };

  // 并行控制
  const parallelCtl = <T extends (...args: any[]) => any>(method: T, path: DomainPaths) => {
    const args = _.get(parallels, path);
    if (!args) return method;

    return deps.parallel(method, { path, ...args });
  };

  // 方法加工执行顺序从右往左
  handle(graceful.runnerAsync, autoCIA, parallelCtl, output, validator, logging);

  return defines as unknown as Services;
};
