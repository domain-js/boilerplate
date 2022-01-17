export { profile, Profile } from "../../_schemas/profile-has-token";

export type Params = {
  /** "是否需要包含敏感信息，mobile+role(仅管理员可以设置为 yes) */
  _includeSecretInfo: "yes" | "no";

  /** 分页起始位置 */
  _startIndex: number;

  /** 分页返回条目数 */
  _maxResults: number;
};

export const params = {
  description: "获取用户列表",
  type: "object",
  properties: {
    _includeSecretInfo: {
      description: "是否需要包含敏感信息，mobile+role(仅管理员可以设置为 yes)",
      type: "string",
      enum: ["yes", "no"],
    },
    _startIndex: {
      description: "分页起始位置",
      type: "integer",
      minimum: 0,
    },
    _maxResults: {
      description: "分页返回条目数",
      type: "integer",
      minimum: 1,
      maximum: 1000,
    },
  },
};
