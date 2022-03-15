import type { TDeps } from "../../deps";
import type { Profile } from "../_schemas/profile-has-token";

export { Profile, profile } from "../_schemas/profile-has-token";

export interface Params {
  /** Notice ID */
  id: string;
  /** 已读状态 */
  value: "read" | "unread";
}

export const params = {
  description: "更改notice 已读状态",
  type: "object",
  required: ["id", "value"],
  additionalProperties: false,
  properties: {
    id: {
      description: "Notice ID",
      type: "string",
    },
    value: {
      description: "已读状态",
      type: "string",
      enum: ["read", "unread"],
    },
  },
};

export function Main(cnf: any, deps: TDeps) {
  const { helper, errors } = deps;

  /** 修改状态 */
  return async (profile: Profile, params: Params) => {
    const { id, value } = params;
    const { item, isAdmin } = await helper.notice(profile, id);
    if (item.status === value) throw errors.notAllowed("不需要修改");

    item.status = value;
    return item.save({ fields: ["status"], silent: true });
  };
}
