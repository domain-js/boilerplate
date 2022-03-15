import { MOBILE_VERIFY_CODE_LENGTH } from "../../consts";
import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile";

export { Profile, profile } from "../_schemas/profile";

export interface Params {
  /** 账号(mobile/email) */
  account: string;
  /** 密码, md5 后 */
  password?: string;
  /** 验证码 */
  code?: string;
  /** 设备 ID */
  deviceId?: string;
}

export const params = {
  description: "用户登录",
  type: "object",
  additionalProperties: false,
  oneOf: [{ required: ["account", "password"] }, { required: ["account", "code"] }],
  properties: {
    account: {
      description: "账号, mobile/email",
      type: "string",
      minLength: 5,
      maxLength: 20,
    },
    password: {
      description: "用户密码，md5 后",
      type: "string",
      minLength: 32,
      maxLength: 32,
    },
    code: {
      description: "验证码登录",
      type: "string",
      minLength: MOBILE_VERIFY_CODE_LENGTH,
      maxLength: MOBILE_VERIFY_CODE_LENGTH,
    },
    deviceId: {
      description: "设备ID",
      type: "string",
    },
  },
};

export function Main(cnf: any, deps: TDeps) {
  const { errors, hUser, Auth } = deps;

  return async (profile: Profile, params: Params) => {
    if (profile.type !== "user") throw errors.notAllowed("仅用户可以操作");
    const { account, password, code, deviceId } = params;

    const { realIp } = profile;

    const user = await hUser.auth(realIp, account, password, code);
    if (user.status !== "enabled") throw errors.notAllowed("账号被禁用");
    // 普通用户也可以登录，因此这里不需要判断是否为管理人员

    const auth = await Auth.generate(user, realIp, deviceId);
    return Auth.readUserByToken(auth.token);
  };
}
