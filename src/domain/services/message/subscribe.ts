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
    message: { Clients },
  } = deps;

  /** 订阅 */
  return async (profile: Profile, client: Client) => {
    const { session } = await helper.message(profile);

    Clients.online(session.id, client);

    return session;
  };
}
