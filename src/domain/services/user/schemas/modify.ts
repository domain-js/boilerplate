export { profile, Profile } from "../../_schemas/profile-has-token";

export type Params = {
  id: number;
  name?: string;
  password?: string;
  origPass?: string;
  code?: string;
};

export const params = {
  description: "编辑用户",
  type: "object",
  required: ["id"],
  properties: {
    id: {
      description: "用户ID",
      type: "integer",
    },
    name: {
      description: "用户名, 全局唯一",
      type: "string",
      minLength: 1,
      maxLength: 64,
    },
    password: {
      description: "要重置的登录密码",
      type: "string",
      minLength: 4,
      maxLength: 30,
    },
    origPass: {
      description: "原密码md5值",
      type: "string",
      minLength: 32,
      maxLength: 32,
    },
    code: {
      description: "Mobile verify opt code for reset passwod",
      type: "string",
    },
  },
};
