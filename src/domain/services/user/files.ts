import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 所属用户ID */
  userId: number;

  /** 分页起始位置 */
  _startIndex: number;

  /** 分页返回条目数 */
  _maxResults: number;
}

export const params = {
  description: "获取用户文件列表",
  type: "object",
  properties: {
    userId: {
      description: "文件所属用户ID",
      type: "integer",
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

export function Main(_cnf: any, deps: TDeps) {
  const { rest, File, errors, helper, checker } = deps;

  /** 查看文件列表 */
  return async (profile: Profile, params: Params) => {
    const { session, user } = await helper.user(profile, params.userId);
    if (!user) throw errors.notFound("user", params.userId);

    await checker.privacy([
      [checker.equal, user.id, session.id], // 自己
    ]);

    Object.assign(params, { creatorId: user.id });

    return rest.list(File, params);
  };
}
