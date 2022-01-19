export { profile, Profile } from "../../_schemas/profile";

export type Params = {
  /** 用户名，全局唯一 */
  name: string;
  /** 手机号码 */
  mobile: string;
  /** 密码原文, 这里没有传递md5 是为了服务端校验密码强度 */
  password: string;
};

export const params = {
  description: "注册用户",
  type: "object",
  required: ["name", "mobile", "password"],
  additionalProperties: false,
  properties: {
    name: {
      description: "用户名, 全局唯一",
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
    password: {
      description: "登录密码",
      type: "string",
      minLength: 4,
      maxLength: 30,
    },
  },
};
