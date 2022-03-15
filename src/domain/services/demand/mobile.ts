import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 手机号码 */
  mobile: string;
  /** 用户ID */
  userId: number;
}

export const params = {
  description: "申请更换手机号码",
  type: "object",
  required: ["mobile", "userId"],
  additionalProperties: false,
  properties: {
    mobile: {
      description: "要申请更换的新手机号码",
      type: "string",
      minLength: 5,
      maxLength: 20,
    },
    userId: {
      description: "用户ID",
      type: "integer",
    },
  },
};

export function Main(cnf: any, deps: TDeps) {
  const { Demand, rest, hSession, errors, User, getOrThrown, checker } = deps;

  /** 申请更换手机号码 */
  return async (profile: Profile, params: Params) => {
    const { clientIp } = profile;
    const { mobile } = params;

    const session = await hSession(profile);
    if (session._type !== "user") throw errors.notAllowed("仅用户可以操作");
    const user = await getOrThrown(User, params.userId);

    await checker.privacy([
      [checker.equal, user.id, session.id],
      [checker.equal, session.role, "admin"],
    ]);

    if (user.mobile === mobile)
      throw errors.notAllowed("更换的手机号码必须和现在的不一样，否则没有意义");

    const mobileExists = await User.findOne({ where: { mobile } });
    if (mobileExists) throw errors.userMobileDuplication(mobile);

    Object.assign(params, { type: "oldMobile", to: user.mobile });
    await rest.add(Demand, params, false, undefined, {
      creatorId: 0,
      clientIp,
    });

    Object.assign(params, { type: "newMobile", to: mobile });
    await rest.add(Demand, params, false, undefined, {
      creatorId: 0,
      clientIp,
    });

    return "ok";
  };
}
