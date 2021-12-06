import { Main, DM } from "@domain.js/main";
import { cnf } from "./configs";
import { errors } from "./errors";
import { Modules } from "./deps/defines";
import utils from "./utils";

const Start = Main(cnf.features);
const defaults = Start(cnf);
// 初始模块定义
const inits = {
  ...defaults,
  errors,
  utils,
};

// 冻结，以免被无故篡改
export const deps = Object.freeze(DM.auto(Modules, inits, [cnf, inits]));

export type Deps = typeof deps;
