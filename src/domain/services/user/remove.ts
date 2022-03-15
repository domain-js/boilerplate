import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 要删除的用户id */
  id: number;
}

export const params = {
  description: "删除用户",
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
  const { errors, helper, checker, rest } = deps;

  /** 删除用户 */
  return async (profile: Profile, params: Params) => {
    const { user, session } = await helper.user(profile, params.id);
    if (!user) throw errors.notFound("user", params.id);

    await checker.privacy([
      [checker.equal, session.role, "admin"], // 管理员
    ]);

    return rest.remove(user, session.id);
  };
}
