export { profile, Profile } from "../../_schemas/profile-has-token";

export type Params = {
  /** 要检查的用户名 */
  value: string;
};

export const params = {
  description: "查看用户名是否存在",
  type: "object",
  required: ["value"],
  properties: {
    value: {
      description: "用户名",
      type: "string",
      minLength: 1,
      maxLength: 64,
    },
  },
};
