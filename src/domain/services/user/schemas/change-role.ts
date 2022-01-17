export { profile, Profile } from "../../_schemas/profile-has-token";

export type Params = {
  /** 用户ID */
  id: number;
  /** 要更改角色的值 */
  value: "member" | "admin";
};

export const params = {
  description: "修改用户角色",
  type: "object",
  required: ["id", "value"],
  properties: {
    id: {
      description: "用户ID",
      type: "integer",
    },
    value: {
      description: "状态值",
      type: "string",
      enum: ["member", "admin"],
    },
  },
};
