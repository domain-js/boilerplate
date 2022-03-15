import type { TDeps } from "../../deps";
import type { FileParams } from "../../deps/uploader";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** 文件名，全局唯一 */
  name: string;
  /** 文件 */
  __files: FileParams[];
  /** 用户ID */
  userId: number;
}

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
    name: {
      description: "文件名称",
      type: "string",
    },
  },
};

export function Main(cnf: any, deps: TDeps) {
  const { uploader, File, errors, checker, rest, helper } = deps;

  /** 上传文件 */
  return async (profile: Profile, params: Params) => {
    const { session, user, isAdmin } = await helper.user(profile, params.userId);
    if (!user) throw errors.notFound("user", params.userId);

    await checker.privacy([
      [checker.equal, user.id, session.id], // 自己
    ]);

    const { clientIp } = profile;
    const _file = await uploader.handler(params.__files);

    return rest.add(File, { ...params, ..._file }, isAdmin, undefined, {
      creatorId: session.id,
      clientIp,
    });
  };
}
