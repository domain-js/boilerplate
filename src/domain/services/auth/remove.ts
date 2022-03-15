import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export const params = {
  description: "退出登录状态",
};

export function Main(cnf: any, deps: TDeps) {
  const { hSession, errors, Auth } = deps;

  return async (profile: Profile) => {
    if (profile.type !== "user") throw errors.notAllowed("仅用户可以操作");
    await hSession(profile);
    const { token } = profile;
    const auth = await Auth.findOne({ where: { token } });
    if (auth) await auth.destroy();

    return true;
  };
}
