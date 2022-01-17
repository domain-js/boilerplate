export { profile, Profile } from "../../_schemas/profile-has-token";

export type Params = {
  /** 用户id */
  id: number;
  /** 关联资源 */
  _includes?: "avatarFiles"[];
};

export const params = {
  description: "查看用户",
  type: "object",
  required: ["id"],
  properties: {
    id: {
      description: "用户ID",
      type: "integer",
    },
    _includes: {
      description: "关联资源",
      type: "array",
      items: {
        description: "要关联出来的资源名称",
        type: "string",
        enum: ["avatarFile"],
      },
    },
  },
};
