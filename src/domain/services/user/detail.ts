import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 用户id */
  id: number;
}

export const params = {
  description: "查看用户",
  type: "object",
  required: ["id"],
  properties: {
    id: {
      description: "用户ID",
      type: "integer",
    },
  },
};

export function Main(_cnf: any, deps: TDeps) {
  const { _, consts, errors, helper } = deps;
  const { USER_SECRET_INFO_KEYS } = consts;

  /** 获取用户详情 */
  return async (profile: Profile, params: Params) => {
    const { isAdmin, user } = await helper.user(profile, params.id);
    if (!user) throw errors.notFound("user", params.id);
    if (!isAdmin) throw errors.notAllowed();

    const json = _.omit(user.toJSON(), isAdmin ? [] : USER_SECRET_INFO_KEYS);
    return json;
  };
}
