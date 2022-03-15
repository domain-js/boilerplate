import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";
import list from "../_schemas/standard-list-schema";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 所属用户ID */
  userId: number;

  /** 分页起始位置 */
  _startIndex: number;

  /** 分页返回条目数 */
  _maxResults: number;

  /** 包含的信息 */
  _includes: "interlocutor"[];
}

export const params = list("获取用户自己notice列表", ["interlocutor"], {
  userId: {
    description: "用户自己ID",
    type: "integer",
  },
});

export function Main(_cnf: any, deps: TDeps) {
  const { rest, errors, helper, checker, Notice, expander } = deps;

  /** 查看消息提醒列表 */
  return async (profile: Profile, params: Params) => {
    const { _includes, userId } = params;
    const { session, user } = await helper.user(profile, userId);
    if (!user) throw errors.notFound("user", userId);

    await checker.privacy([
      [checker.equal, user.id, session.id], // 自己
    ]);

    const { rows, count } = await rest.list(Notice, params, undefined, true);

    if (Array.isArray(_includes) && _includes.includes("interlocutor"))
      await expander.users(rows, "interlocutorId", "interlocautor");

    return { rows, count };
  };
}
