import type { TDeps } from "../../deps";
import type { AddFileSlideParams } from "../../deps/uploader";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export type Params = AddFileSlideParams & {
  /** 用户ID */
  userId: number;
};

export const params = {
  description: "文件上传",
  type: "object",
  properties: {
    userId: {
      description: "所属用户ID",
      type: "integer",
    },
    __files: {
      description: "选择上传的文件",
      type: "object",
    },
    index: {
      description: "分片序列值,从0开始",
      type: "integer",
    },
    total: {
      description: "分片总量",
      type: "integer",
    },
    hash: {
      description: "文件hash值(md5)",
      type: "string",
    },
    size: {
      description: "文件大小，字节数",
      type: "integer",
    },
  },
};

export function Main(_cnf: any, deps: TDeps) {
  const { uploader, errors, checker, helper } = deps;

  /** 大文件分片处理 */
  return async (profile: Profile, params: Params) => {
    const { session, user } = await helper.user(profile, params.userId);
    if (!user) throw errors.notFound("user", params.userId);

    await checker.privacy([
      [checker.equal, user.id, session.id], // 自己
      [checker.equal, session.role, "admin"], // 管理员
    ]);

    return uploader.addFileSlice(params);
  };
}
