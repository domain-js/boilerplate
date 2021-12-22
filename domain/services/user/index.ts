import { TDeps } from "../../deps";

export function Main(cnf: any, deps: TDeps) {
  const { _, async, consts, errors, checker, rest, helper } = deps;

  const { USER_SECRET_INFO_KEYS } = consts;

  // 允许游客访问
  const ALLOW_GUEST_ACCESS = true;
  // 不允许游客访问
  const NOT_ALLOW_GUEST_ACCESS = false;

  const _check = async (profile, id, guestAllowed = NOT_ALLOW_GUEST_ACCESS) => {
    const ret = {};
    if (profile.token) {
      ret.session = await helper.session(profile);
      ret.isAdmin = ret.session.role === "admin";
    }
    if (!guestAllowed && !profile.token) throw errors.notAllowed();

    if (id) ret.user = await helper.getOrThrown(User, id);

    return ret;
  };

  /* 注册 */
  const add = async (profile, params) => {
    const { clientIp } = profile;
    const { name, mobile, password, code } = params;

    const nameExists = await User.findOne({ where: { name } });
    if (nameExists) throw errors.userNameDuplication(name);

    const mobileExists = await User.findOne({ where: { mobile } });
    if (mobileExists) throw errors.userMobileDuplication(mobile);

    await Code.verify(mobile, code, "register");

    const args = { name, mobile, ...User.genSaltAndPassword(password) };
    const user = await rest.add(User, args, false, null, {
      creatorId: 0,
      clientIp,
    });

    return user;
  };

  const list = async (profile, params) => {
    const { isAdmin } = await _check(profile, null, ALLOW_GUEST_ACCESS);
    const { _includeSecretInfo } = params;

    const { rows, count } = await rest.list(User, params);
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

  const detail = async (profile, params) => {
    const { isAdmin, user } = await _check(profile, params.id, ALLOW_GUEST_ACCESS);

    const json = _.omit(user.toJSON(), isAdmin ? [] : USER_SECRET_INFO_KEYS);

    const { _includes } = params;
    if (Array.isArray(_includes) && _includes.length) {
      if (_includes.includes("awards")) {
        const rows = _.map(user.awardIds, (id) => ({ id }));
        await helper.expander.standard(Award, rows, "award", "id");
        const awards = _.chain(rows)
          .map((x) => x.award)
          .compact()
          .value();

        await helper.expander.standard(File, awards, "avatarFile", "avatar");

        json.awards = awards;
      }
    }

    return json;
  };

  const modify = async (profile, params) => {
    const { session, isAdmin, user } = await _check(profile, params.id);
    const { name, password, origPass, code } = params;

    await checker.privacy([
      [checker.equal, user.id, session.id], // 自己
    ]);

    if (!name && !password) throw errors.uselessRequest();

    if (password) {
      // 验证原密码或者手机验证码是否正确
      try {
        await async.tryEach([
          async () => {
            await helper.user.auth(profile.realIp, user.name, origPass);
          },
          async () => {
            await Code.verify(user.mobile, code, "resetPassword");
          },
        ]);
      } catch (e) {
        throw errors.resetPasswordNeedOrigPasswordOrMobileVerifyOptCode();
      }

      const { salt, password: md5password } = User.genSaltAndPassword(password);
      if (user.password === md5password) {
        throw errors.newPasswordSameOriginPassword();
      }
      // 如果设置了密码，说明要修改密码，此时应该重新计算密码和密码扰码
      Object.assign(params, { salt, password: md5password });
    }

    return rest.modify(User, user, params, isAdmin);
  };

  const changeMobile = async (profile, params) => {
    const { id, mobile, origPass, code } = params;
    const { session, user } = await _check(profile, id);

    await checker.privacy([
      [checker.equal, user.id, session.id], // 自己
    ]);

    if (mobile === user.mobile) throw errors.resetMobileSameOriginMobile(mobile);
    const mobileExists = await User.findOne({ where: { mobile } });
    if (mobileExists) throw errors.userMobileDuplication(mobile);

    // 密码用来验证是否是本人操作
    await helper.user.auth(profile.realIp, user.mobile, origPass);
    // 手机验证码用来验证新手机号码是否是自己的
    await Code.verify(mobile, code, "changeMobile");

    await user.changeFiled("mobile", mobile);

    return user;
  };

  const changeFieldByAdmin = (field) => async (profile, params) => {
    const { id, value } = params;
    const { session, user } = await _check(profile, id);

    await checker.privacy([
      [checker.equal, session.role, "admin"], // 管理员
    ]);

    await user.changeFiled(field, value);

    return user;
  };

  const remove = async (profile, params) => {
    const { user, session } = await _check(profile, params.id);

    await checker.privacy([
      [checker.equal, session.role, "admin"], // 管理员
    ]);

    return rest.remove(user, session.id);
  };

  const existsByField = (field) => async (profile, params) => {
    const { value } = params;

    const exists = await User.findOne({ where: { [field]: value } });

    return { exists: Boolean(exists) };
  };

  return {
    add,
    list,
    detail,
    modify,
    remove,
    nameExists: existsByField("name"),
    mobileExists: existsByField("mobile"),
    changeStatus: changeFieldByAdmin("status"),
    changeRole: changeFieldByAdmin("role"),
    changeMobile,
  };
}
