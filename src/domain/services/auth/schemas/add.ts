export { profile, Profile } from "../../_schemas/profile";

export type Params = {
  /** 手机号码 */
  mobile: string;
  /** 密码, md5 后 */
  password: string;
  /** 设备 ID */
  deviceId?: string;
};

export const params = {
  description: "用户登录",
  type: "object",
  additionalProperties: false,
  required: ["mobile", "password"],
  properties: {
    mobile: {
      description: "手机号码",
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
    deviceId: {
      description: "设备ID",
      type: "string",
    },
  },
};
