import * as _ from "lodash";
import { GetSchemaByPath } from "@domain.js/main/dist/http/defines";
import { Cnf } from "../configs";
import { TDeps } from "../deps";
import defines from "./defines";
import output from "./_output";
import parallels from "./_parallels";
import { errors } from "../errors";

const schemas = {};
export const getSchemaByPath: GetSchemaByPath = (path) => {
  const _schema = _.get(schemas, path);
  if (!_schema) throw errors.notFound("该接口不存在或未定义参数 schema");
  return _schema;
};

export const Services = (cnf: Cnf, deps: TDeps) => {
  const {
    _,
    schema,
    graceful,
    cia,
    U: { deepFreeze },
  } = deps;

  interface Services {
    [k: string]: Function | Services;
  }
  /**
   * 提取一个对象上的方法
   * @memberof U
   * @params {object} object 要被提取的对象
   *
   * @return {array[path: string, fn: function]}
   */
  const pickMethods = (obj: Services, _path: string[] = [], ret: [string, Function][] = []) => {
    for (const key of Object.keys(obj)) {
      const newPath = _path.slice();
      newPath.push(key);
      if (typeof obj[key] === "function") {
        ret.push([newPath.join("."), obj[key] as Function]);
      } else {
        pickMethods(obj[key] as Services, newPath, ret);
      }
    }
    return ret;
  };

  const handle = (methods: [string, Function][], ...handlers: Function[]) => {
    const handleds = {};
    for (const [path, method] of methods) {
      _.set(
        handleds,
        path,
        handlers.reduce((m, h) => h(m, path), method),
      );
    }

    return handleds;
  };

  const services = {};
  for (const x of Object.keys(defines)) {
    _.set(services, x, defines[x as keyof typeof defines](cnf, deps));
  }

  // 检查 cia 是否已经准备好，如果没有，那说明有多余的regist，或者话句话说有缺失的link
  if (!cia.checkReady()) {
    console.log("cia lost link: %o", cia.getUnlinks());
    throw Error("CIA has not been ready");
  }

  // 自动执行cia相关的commit
  const autoCIA = (method: Function, path: string) => {
    const name = `domain.${path}`;
    if (!cia.domainPaths.has(name)) return method;
    return async (...args: any) => {
      const res = await method(...args);
      cia.submit(name, res);
      return res;
    };
  };

  // 自动记录 logging
  const logging = <T extends (...args: any[]) => any>(method: T, path: string) =>
    deps.logger.logger(method, path, true);

  // 自动参数校验
  const validator = <T extends (...args: any[]) => any>(method: T, path: string) => {
    const _schema = _.get(schemas, path);
    if (!_schema) return method;
    return schema.auto(method, _schema, errors.domainMethodCallArgsInvalid, path);
  };

  // 并行控制
  const parallelCtl = <T extends (...args: any[]) => any>(method: T, path: string) => {
    const args = _.get(parallels, path);
    if (!args) return method;

    return deps.parallel(method, { path, ...args });
  };

  // deepFreeze 深度冻结领域对外方法，谨防被篡改
  // 方法加工执行顺序从右往左
  return deepFreeze(
    handle(
      pickMethods(services),
      graceful.runnerAsync,
      autoCIA,
      parallelCtl,
      output,
      validator,
      logging,
    ),
  );
};
