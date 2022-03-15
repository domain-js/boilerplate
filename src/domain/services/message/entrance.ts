import { Client } from "@domain.js/main/dist/http/socket";

import type { TDeps } from "../../deps";
import { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export const params = {
  description: "注册监听",
  type: "object",
};

export function Main(cnf: any, deps: TDeps) {
  const {
    helper,
    getOrThrown,
    errors,
    message: { Rooms },
  } = deps;

  /** 加入某个房间, 只做判断，有问题请抛出异常 throw Error */
  return async (profile: Profile, client: Client) => {
    // 提取 roomId
    const { roomId } = profile;
    if (!roomId) throw Error("未包含 roomId 信息");

    const { session, isAdmin } = await helper.message(profile);

    // TODO 检测是否可以加入房间

    throw errors.notFound("room", roomId);
  };
}
