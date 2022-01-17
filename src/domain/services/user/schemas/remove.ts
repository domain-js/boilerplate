export { profile, Profile } from "../../_schemas/profile-has-token";

export type Params = {
  /** 要删除的用户id */
  id: number;
};

export const params = {
  description: "删除用户",
  type: "object",
  required: ["id"],
  properties: {
    id: {
      description: "用户ID",
      type: "integer",
    },
  },
};
