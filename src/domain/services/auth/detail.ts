import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export const params = {
  description: "查看登录信息",
};

export function Main(cnf: any, deps: TDeps) {
  const { hSession } = deps;

  return async (profile: Profile) => hSession(profile);
}
