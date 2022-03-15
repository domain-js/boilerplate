import { MOBILE_VERIFY_CODE_LENGTH } from "../../consts";
import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile";

export { Profile, profile } from "../_schemas/profile";

export interface Params {
  /** 用户名 */
  name?: string;
  /** 手机号码 */
  mobile: string;
  /** 手机验证码 */
  code: string;
  /** 密码原文, 这里没有传递md5 是为了服务端校验密码强度 */
  password?: string;
  /** 设备ID */
  deviceId?: string;
}

export const params = {
  description: "注册用户",
  type: "object",
  required: ["mobile", "code"],
  additionalProperties: false,
  properties: {
    name: {
      description: "用户名 ",
      type: "string",
      minLength: 1,
      maxLength: 64,
    },
    mobile: {
      description: "手机号码",
      type: "string",
      minLength: 5,
      maxLength: 20,
    },
    code: {
      description: "手机验证码",
      type: "string",
      minLength: MOBILE_VERIFY_CODE_LENGTH,
      maxLength: MOBILE_VERIFY_CODE_LENGTH,
    },
    password: {
      description: "登录密码",
      type: "string",
      minLength: 4,
      maxLength: 30,
    },
    deviceId: {
      description: "设备ID",
      type: "string",
    },
  },
};

export function Main(cnf: any, deps: TDeps) {
  const { consts, errors, Auth, User, Demand, rest } = deps;

  const { USER_SECRET_INFO_KEYS, RESIZE_IMAGES } = consts;

  /* 注册 */
  return async (profile: Profile, params: Params) => {
    const { clientIp, realIp } = profile;
    const { mobile, code, deviceId } = params;

    const mobileExists = await User.findOne({ where: { mobile } });
    if (mobileExists) throw errors.userMobileDuplication(mobile);

    await Demand.verify(mobile, code, "user");

    if (params.password) {
      Object.assign(params, User.resetSecurity(params, false));
    }

    // 用户名可选，默认是手机号码后四位
    if (!params.name) params.name = params.mobile.slice(-4);
    const user = await rest.add(User, params, false, undefined, {
      creatorId: 0,
      clientIp,
    });

    const auth = await Auth.generate(user, realIp, deviceId);
    return Auth.readUserByToken(auth.token);
  };
}
