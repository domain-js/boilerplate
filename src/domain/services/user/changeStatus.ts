import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 用户ID */
  id: number;
  /** 要更改的状态值 */
  value: "enabled" | "disabled";
}

export const params = {
  description: "修改用户状态",
  type: "object",
  required: ["id", "value"],
  properties: {
    id: {
      description: "用户ID",
      type: "integer",
    },
    value: {
      description: "状态值",
      type: "string",
      enum: ["enabled", "disabled"],
    },
  },
};

export function Main(cnf: any, deps: TDeps) {
  const { checker, consts, errors, Auth, User, Demand, rest, helper } = deps;

  /** 更改用户状态，启用或禁用 */
  return async (profile: Profile, params: Params) => {
    const { id, value } = params;
    const { session, user } = await helper.user(profile, id);
    if (!user) throw errors.notFound("user", params.id);

    await checker.privacy([
      [checker.equal, session.role, "admin"], // 管理员
    ]);

    await user.changeFiled("status", value);

    return user;
  };
}
