import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 用户ID */
  userId: number;
}

export const params = {
  description: "申请重置某个用户的密码",
  type: "object",
  required: ["userId"],
  additionalProperties: false,
  properties: {
    userId: {
      description: "用户ID",
      type: "integer",
    },
  },
};

export function Main(cnf: any, deps: TDeps) {
  const { Demand, rest, hSession, errors, User, getOrThrown, checker } = deps;

  /** 申请重置密码 */
  return async (profile: Profile, params: Params) => {
    const { clientIp } = profile;

    const session = await hSession(profile);
    if (session._type !== "user") throw errors.notAllowed("仅用户可以操作");
    const user = await getOrThrown(User, params.userId);

    await checker.privacy([[checker.equal, user.id, session.id]]);

    Object.assign(params, { type: "password", to: user.mobile });

    await rest.add(Demand, params, false, undefined, {
      creatorId: 0,
      clientIp,
    });

    return "ok";
  };
}
