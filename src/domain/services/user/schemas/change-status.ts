export { profile, Profile } from "../../_schemas/profile-has-token";

export type Params = {
  /** 用户ID */
  id: number;
  /** 要更改的状态值 */
  value: "enabled" | "disabled";
};

export const params = {
  description: "修改用户状态",
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
      enum: ["enabled", "disabled"],
    },
  },
};
