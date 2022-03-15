import type { TDeps } from "../../deps";
import type { MergeFileSlideParams } from "../../deps/uploader";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export type Params = MergeFileSlideParams & {
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
    name: {
      description: "文件名称",
      type: "string",
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
  const { uploader, rest, File, errors, checker, helper } = deps;

  /** 大文件上传合并文件 */
  return async (profile: Profile, params: Params) => {
    const { session, user, isAdmin } = await helper.user(profile, params.userId);
    if (!user) throw errors.notFound("user", params.userId);

    await checker.privacy([
      [checker.equal, user.id, session.id], // 自己
    ]);

    const _file = uploader.mergeFileSlice(params);
    Object.assign(params, { creatorId: user.id });
    const { clientIp } = profile;
    // 调用通用的add方法
    return rest.add(File, { ...params, ..._file }, isAdmin, undefined, {
      creatorId: session._id,
      clientIp,
    });
  };
}
