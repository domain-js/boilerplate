import { ModelBase, ModelStatic } from "@domain.js/main/dist/deps/sequelize";
import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";

import type { TDeps } from "../../deps";

export const Deps = ["_", "errors", "hSession", "getOrThrown", "User", "online"] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export function Main(cnf: any, deps: Deps) {
  const { _, User, errors, hSession, getOrThrown, online } = deps;

  /** 标准扩充单挑数据 */
  const standard = async <M extends ModelBase, K extends string, T extends Record<K, number>>(
    Model: ModelStatic<M>,
    row: T,
    key: K,
    target: string,
  ) => {
    const item = await Model.getByPk(row[key]);
    if (!item) return;
    Object.assign(row, {
      [target]: item.toJSON(),
    });
  };

  /** 扩充一条用户单条数据 */
  const user = async <K extends string, T extends Record<K, number>>(
    row: T,
    key: K,
    target: string,
  ) => {
    const item = await User.getByPk(row[key]);
    if (!item) return;
    Object.assign(row, {
      [target]: {
        ..._.pick(item, ["id", "name", "avatar"]),
        online: await online.has(row[key]),
      },
    });
  };

  /** 扩充多条用户单条数据 */
  const users = async <K extends string, T extends Record<K, number>>(
    rows: T[],
    key: K,
    target: string,
  ) => {
    for await (const x of rows) {
      await user(x, key, target);
    }
  };

  return { user, users, standard };
}
