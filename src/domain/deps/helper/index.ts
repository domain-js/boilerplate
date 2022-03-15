import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";

import type { TDeps } from "../../deps";
import { Profile } from "../../services/_schemas/profile";

export const Deps = ["errors", "hSession", "getOrThrown", "Notice", "User"] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export function Main(cnf: any, deps: Deps) {
  const { Notice, User, errors, hSession, getOrThrown } = deps;

  /** socket message 相关前置检测 */
  const message = async (profile: Profile) => {
    const session = await hSession(profile);
    const isAdmin = session._type === "user" && session.role === "admin";

    return { isAdmin, session };
  };

  /** notice 相关前置检测 */
  const notice = async (profile: Profile, id: string) => {
    const session = await hSession(profile);
    if (session._type !== "user") throw errors.notAllowed("仅用户可以操作");
    const isAdmin = session.role === "admin";
    const item = await getOrThrown(Notice, id);
    if (item.userId !== session.id) throw errors.notFound("notice", id);

    return { isAdmin, session, item };
  };

  /** user 相关前置检测 */
  const user = async (profile: Profile, id?: number) => {
    let user = null;

    const session = await hSession(profile);
    if (session._type !== "user") throw errors.notAllowed("仅用户可以操作");
    const isAdmin = session.role === "admin";

    if (typeof id === "number") user = await getOrThrown(User, id);

    Object.assign(profile.extra, { session });

    return { isAdmin, session, user };
  };

  return {
    message,
    notice,
    user,
  };
}
