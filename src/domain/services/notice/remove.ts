import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** Slide ID */
  id: string;
}

export const params = {
  description: "删除一个 授权",
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: {
    id: {
      description: "Slide ID",
      type: "string",
      maxLength: 25,
    },
  },
};

export function Main(cnf: any, deps: TDeps) {
  const { helper, rest } = deps;

  /** 删除 notice */
  return async (profile: Profile, params: Params) => {
    const { id } = params;
    const { session, item } = await helper.notice(profile, id);

    return rest.remove(item, session.id);
  };
}
