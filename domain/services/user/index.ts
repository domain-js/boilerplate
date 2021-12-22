import { TModel } from "@domain.js/main/dist/deps/rest/defines";
import type { TDeps } from "../../deps";
import { Profile } from "../_schemas/profile";
import { Profile as ProfileHasToken } from "../_schemas/profile-has-token";
import { Params as AddParams } from "./schemas/add";
import { Params as ListParams } from "./schemas/list";
import { Params as DetailParams } from "./schemas/detail";
import { Params as ModifyParams } from "./schemas/modify";
import { Params as RemoveParams } from "./schemas/remove";
import { Params as ChangeRoleParams } from "./schemas/change-role";
import { Params as ChangeStatusParams } from "./schemas/change-status";

export function Main(cnf: any, deps: TDeps) {
  const { _, consts, errors, checker, User, getOrThrown, rest, hSession, hUser } = deps;

  const { USER_SECRET_INFO_KEYS } = consts;

  // 允许游客访问
  const ALLOW_GUEST_ACCESS = true;
  // 不允许游客访问
  const NOT_ALLOW_GUEST_ACCESS = false;

  const _check = async (profile: Profile, id?: number, guestAllowed = NOT_ALLOW_GUEST_ACCESS) => {
    let isAdmin = false;
    let session;
    let user;

    if (typeof profile.token === "string") {
      session = await hSession(profile);
      isAdmin = session.role === "admin";
    }

    if (!guestAllowed && !profile.token) throw errors.notAllowed();

    if (typeof id === "number") user = await getOrThrown(User, id);

    return { isAdmin, session, user };
  };

  /* 注册 */
  const add = async (profile: Profile, params: AddParams) => {
    const { clientIp } = profile;
    const { name, mobile, password } = params;

    const nameExists = await User.findOne({ where: { name } });
    if (nameExists) throw errors.userNameDuplication(name);

    const mobileExists = await User.findOne({ where: { mobile } });
    if (mobileExists) throw errors.userMobileDuplication(mobile);

    const args = { name, mobile, ...User.genSaltAndPassword(password) };
    const user = await rest.add(User as TModel, args, false, undefined, {
      creatorId: 0,
      clientIp,
    });

    return user;
  };

  const list = async (profile: Profile, params: ListParams) => {
    const { isAdmin } = await _check(profile, undefined, ALLOW_GUEST_ACCESS);
    const { _includeSecretInfo } = params;

    const { rows, count } = await rest.list(User as TModel, params);
    // 非管理员或者不需要手机号码要屏蔽掉手机号码
    // 换言之只有管理员明确需要手机号码的情况才会返回
    if (!isAdmin || _includeSecretInfo !== "yes") {
      for (let i = 0; i < rows.length; i += 1) {
        const item = rows[i];
        rows[i] = _.omit(item.toJSON(), USER_SECRET_INFO_KEYS);
      }
    }

    return { rows, count };
  };

  const detail = async (profile: Profile, params: DetailParams) => {
    const { isAdmin, user } = await _check(profile, params.id, ALLOW_GUEST_ACCESS);
    if (!user) throw errors.notFound("user", params.id);

    const json = _.omit(user.toJSON(), isAdmin ? [] : USER_SECRET_INFO_KEYS);
    return json;
  };

  const modify = async (profile: ProfileHasToken, params: ModifyParams) => {
    const { session, isAdmin, user } = await _check(profile, params.id);
    if (!user) throw errors.notFound("user", params.id);
    const { name, password, origPass } = params;

    await checker.privacy([
      [checker.equal, user.id, session.id], // 自己
    ]);

    if (!name && !password) throw errors.uselessRequest();

    if (password && origPass) {
      await hUser.auth(profile.realIp, user.name, origPass);
      const { salt, password: md5password } = User.genSaltAndPassword(password);
      if (user.password === md5password) {
        throw errors.newPasswordSameOriginPassword();
      }
      // 如果设置了密码，说明要修改密码，此时应该重新计算密码和密码扰码
      Object.assign(params, { salt, password: md5password });
    }

    return rest.modify(User as TModel, user, params, isAdmin);
  };

  const changeFieldByAdmin = (field: "status" | "role") => {
    const action = async (
      profile: ProfileHasToken,
      params: ChangeRoleParams | ChangeStatusParams,
    ) => {
      const { id, value } = params;
      const { session, user } = await _check(profile, id);
      if (!user) throw errors.notFound("user", params.id);

      await checker.privacy([
        [checker.equal, session.role, "admin"], // 管理员
      ]);

      if (field === "status") {
        await user.changeFiled(field, value as ChangeStatusParams["value"]);
      } else {
        await user.changeFiled(field, value as ChangeRoleParams["value"]);
      }

      return user;
    };

    return action;
  };

  const remove = async (profile: ProfileHasToken, params: RemoveParams) => {
    const { user, session } = await _check(profile, params.id);
    if (!user) throw errors.notFound("user", params.id);

    await checker.privacy([
      [checker.equal, session.role, "admin"], // 管理员
    ]);

    return rest.remove(user, session.id);
  };

  return {
    add,
    list,
    detail,
    modify,
    remove,
    changeStatus: changeFieldByAdmin("status"),
    changeRole: changeFieldByAdmin("role"),
  };
}
