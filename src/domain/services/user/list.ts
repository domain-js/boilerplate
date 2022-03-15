import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 分页起始位置 */
  _startIndex: number;

  /** 分页返回条目数 */
  _maxResults: number;
}

export const params = {
  description: "获取用户列表",
  type: "object",
  properties: {
    _startIndex: {
      description: "分页起始位置",
      type: "integer",
      minimum: 0,
    },
    _maxResults: {
      description: "分页返回条目数",
      type: "integer",
      minimum: 1,
      maximum: 1000,
    },
  },
};

export function Main(_cnf: any, deps: TDeps) {
  const { rest, errors, helper, User, online } = deps;

  /** 查看用户列表 */
  return async (profile: Profile, params: Params) => {
    const { isAdmin } = await helper.user(profile);

    if (!isAdmin) throw errors.notAllowed();
    const { rows, count } = await rest.list(User, params, undefined, true);

    await online.expandList(rows, "id");

    return { rows, count };
  };
}
