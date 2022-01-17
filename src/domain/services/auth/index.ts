import { Cnf } from "../../configs";
import type { TDeps } from "../../deps";
import { Profile } from "../_schemas/profile";
import { Profile as ProfileHasToken } from "../_schemas/profile-has-token";
import { Params as AddParams } from "./schemas/add";

export function Main(cnf: Cnf, deps: TDeps) {
  const { errors, hUser, hSession, Auth } = deps;

  const add = async ({ realIp }: Profile, params: AddParams) => {
    const { mobile, password, deviceId } = params;

    const user = await hUser.auth(realIp, mobile, password);
    if (user.status !== "enabled") throw errors.notAllowed("账号被禁用");
    // 普通用户也可以登录，因此这里不需要判断是否为管理人员

    const auth = await Auth.generate(user, realIp, deviceId);
    await user.increment("loginTimes");
    await user.update({ lastSignedAt: new Date() }, { silent: true, hooks: false });
    const json = user.toJSON ? user.toJSON() : user;
    json.auth = auth.toJSON();
    json.token = json.auth.token;
    json._type = "user";
    json._id = `user-${json.id}`;

    return json;
  };

  const remove = async ({ token }: ProfileHasToken) => {
    await hSession({ token });
    const auth = await Auth.findOne({ where: { token } });
    if (auth) await auth.destroy();

    return true;
  };

  const detail = async (profile: ProfileHasToken) => hSession(profile);

  return { detail, add, remove };
}
