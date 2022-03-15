import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 用户手机号码 */
  mobile?: string;
  /** 用户ID */
  id?: number;
}

export const params = {
  description: "查看用户",
  type: "object",
  oneOf: [
    {
      required: ["id"],
    },
    {
      required: ["mobile"],
    },
  ],
  properties: {
    id: {
      description: "用户ID",
      type: "integer",
    },
    mobile: {
      description: "用户手机号码",
      type: "string",
    },
  },
};

export function Main(_cnf: any, deps: TDeps) {
  const { _, User, errors, helper } = deps;

  /** 通过手机号码查看用户详情 */
  return async (profile: Profile, params: Params) => {
    let { user } = await helper.user(profile, params.id);
    if (!user && params.mobile) {
      user = await User.findOne({ where: { mobile: params.mobile } });
      if (!user) throw errors.notFound("User:mobile", params.mobile);
    }
    if (!user) throw errors.notFound("User", params.id);

    return _.pick(user.toJSON(), ["id", "name", "avatar"]);
  };
}
