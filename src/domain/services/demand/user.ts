import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile";

export { Profile, profile } from "../_schemas/profile";

export interface Params {
  /** 手机号码 */
  mobile: string;
}

export const params = {
  description: "申请成为用户",
  type: "object",
  required: ["mobile"],
  additionalProperties: false,
  properties: {
    mobile: {
      description: "手机号码",
      type: "string",
      minLength: 5,
      maxLength: 20,
    },
  },
};

export function Main(cnf: any, deps: TDeps) {
  const { helper, Demand, rest, User, errors } = deps;

  /** 申请注册 */
  return async (profile: Profile, params: Params) => {
    const { clientIp } = profile;
    const { mobile } = params;

    const mobileExists = await User.findOne({ where: { mobile } });
    if (mobileExists) throw errors.userMobileDuplication(mobile);

    Object.assign(params, { type: "user", to: mobile });

    await rest.add(Demand, params, false, undefined, {
      creatorId: 0,
      clientIp,
    });

    return "ok";
  };
}
