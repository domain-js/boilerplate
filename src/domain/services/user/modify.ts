import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  id: number;
  name?: string;
  avatarFileId?: number;
  password?: string;
  origPass?: string;
  code?: string;
}

export const params = {
  description: "编辑用户",
  type: "object",
  required: ["id"],
  properties: {
    id: {
      description: "用户ID",
      type: "integer",
    },
    name: {
      description: "用户名, 全局唯一",
      type: "string",
      minLength: 1,
      maxLength: 64,
    },
    avatarFileId: {
      description: "头像对应的上传文件ID",
      type: "integer",
    },
    password: {
      description: "要重置的登录密码",
      type: "string",
      minLength: 4,
      maxLength: 30,
    },
    code: {
      description: "Mobile verify opt code for reset passwod",
      type: "string",
    },
    maxDiskMB: {
      description: "允许最大空间消耗",
      type: "integer",
    },
    maxDocsNum: {
      description: "允许最大文档数量",
      type: "integer",
    },
  },
};

export function Main(_cnf: any, deps: TDeps) {
  const { Demand, User, rest, _, checker, File, getOrThrown, consts, errors, helper } = deps;
  const { RESIZE_IMAGES } = consts;

  /** 编辑用户 */
  return async (profile: Profile, params: Params) => {
    const { session, isAdmin, user } = await helper.user(profile, params.id);
    if (!user) throw errors.notFound("user", params.id);
    const { password, code, avatarFileId } = params;

    await checker.privacy([
      [checker.equal, user.id, session.id], // 自己
    ]);

    if (avatarFileId) {
      const avatar = await getOrThrown(File, avatarFileId);
      const file = File.localPath(avatar);
      if (!(await File.isImage(file))) throw errors.notAllowed("头像只能是一个图片");
      if (avatar.creatorId !== session.id) throw errors.notFound("file", avatarFileId);
      Object.assign(params, { avatar: avatar.getDataValue("path") });
      await File.resize(file, "small", RESIZE_IMAGES.avatar);
    } else {
      delete (params as any).avatar;
    }

    if (password && code) {
      await Demand.verify(user.mobile, code, "password");
      User.resetSecurity(params, false);
    }

    return rest.modify(User, user, params, isAdmin);
  };
}
