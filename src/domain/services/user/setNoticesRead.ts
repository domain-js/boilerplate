import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** User ID */
  userId: number;
}

export const params = {
  description: "一键标记所有当前未读notice为已读",
  type: "object",
  required: ["userId"],
  additionalProperties: false,
  properties: {
    userId: {
      description: "User ID",
      type: "integer",
    },
  },
};

export function Main(_cnf: any, deps: TDeps) {
  const { checker, Notice, errors, helper } = deps;

  /** notice 一键标记为已读 */
  return async (profile: Profile, params: Params) => {
    const { userId } = params;
    const { session, user } = await helper.user(profile, userId);
    if (!user) throw errors.notFound("user", userId);

    await checker.privacy([
      [checker.equal, user.id, session.id], // 自己
    ]);

    return Notice.setReadByUserId(userId);
  };
}
