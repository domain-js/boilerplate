import { DM, Main } from "@domain.js/main";
import { ReadonlyArray2union } from "@domain.js/main/dist/types";

import { cnf } from "../configs";
import * as consts from "./consts";
import { errors } from "./errors";
import utils from "./utils";
import Modules = require("./deps/defines");

const Start = Main(cnf.features);
const defaults = Start(cnf);
// 初始模块定义
const inits = {
  ...defaults,
  errors,
  consts,
  utils,
};

// 冻结，以免被无故篡改
export const deps = Object.freeze(DM.auto(Modules, inits, [cnf, inits]));

export type TDeps = typeof deps;

type ModelMains = Pick<typeof Modules, ReadonlyArray2union<typeof consts.MODELS>>;
export type Models = {
  [k in keyof ModelMains]: ReturnType<ModelMains[k]["Main"]>;
};
