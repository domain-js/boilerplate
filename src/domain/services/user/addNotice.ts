import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 当前用户 ID */
  userId: number;
  /** 会话另一方 ID */
  interlocutorId: number;
  /** 消息类型 */
  type: "sentMsg";
  /** 私信内容 */
  content: string;
}

export const params = {
  description: "发送一个私信给某个用户",
  type: "object",
  required: ["userId", "interlocutorId", "content", "type"],
  additionalProperties: false,
  properties: {
    userId: {
      description: "当前用户ID",
      type: "integer",
    },
    type: {
      description: "通知类型",
      type: "string",
      enum: ["sentMsg"],
    },
    interlocutorId: {
      description: "私信会话的另一方",
      type: "integer",
    },
    content: {
      description: "私信内容",
      type: "string",
      minLength: 1,
      maxLength: 4096,
    },
  },
};

export function Main(_cnf: any, deps: TDeps) {
  const { errors, checker, rest, helper, getOrThrown, Notice, User } = deps;

  /** 发送私信 */
  return async (profile: Profile, params: Params) => {
    const { session, user } = await helper.user(profile, params.userId);
    if (!user) throw errors.notFound("user", params.userId);

    await checker.privacy([
      [checker.equal, user.id, session.id], // 自己
    ]);

    const { clientIp } = profile;
    return rest.add(Notice, params, false, undefined, {
      clientIp,
      creatorId: session.id,
    });
  };
}
