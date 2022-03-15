import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 手机号码 */
  mobile: string;
}

export const params = {
  description: "申请登录",
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
  const { Demand, rest } = deps;

  /** 申请登录 */
  return async (profile: Profile, params: Params) => {
    const { clientIp } = profile;

    Object.assign(params, { type: "session", to: params.mobile });

    await rest.add(Demand, params, false, undefined, {
      creatorId: 0,
      clientIp,
    });

    return "ok";
  };
}
