import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";
import { TDeps } from "../../deps";

export const Deps = ["utils", "User", "Code", "consts", "hash", "errors"] as const;

export function Main(cnf: any, deps: Pick<TDeps, ReadonlyArray2union<typeof Deps>>) {
  const {
    utils: { inExpired },
    hash,
    consts,
    errors,
    User,
    Code,
  } = deps;

  const { LOGIN_ERROR_TIMES_MAX, LOGIN_ERROR_LOCK_IP_SECONDS } = consts;

  const _auth = async (realIp: string, mobile: string, password?: string, code?: string) => {
    const user = await User.findOne({ where: { mobile } });
    if (!user) throw errors.loginNameOrPassword();

    if (password) {
      if (user.password !== User.password(password, user.salt)) {
        throw errors.loginNameOrPassword();
      }
    } else if (code) {
      await Code.verify(mobile, code, "login");
    } else {
      throw errors.loginNameOrPassword();
    }

    return user;
  };

  const auth = async (realIp: string, mobile: string, password: string, code: string) => {
    const countKey = `user-auth-error-timers-${realIp}`;
    const lockedAtKey = `user-auth-error-locked-${realIp}`;

    if (LOGIN_ERROR_TIMES_MAX <= (await hash.get(countKey))) {
      const lockedAt = (await hash.get(lockedAtKey)) | 0;
      if (lockedAt) {
        if (!inExpired(lockedAt, LOGIN_ERROR_LOCK_IP_SECONDS)) {
          throw errors.loginLockByIP();
        }
        await hash.del(countKey);
        await hash.del(lockedAtKey);
      }
    }

    try {
      const user = await _auth(realIp, mobile, password, code);
      hash.del(countKey);
      hash.del(lockedAtKey);
      return user;
    } catch (e) {
      await hash.incr(countKey);
      await hash.set(lockedAtKey, `${(Date.now() / 1000) | 0}`);
      throw e;
    }
  };

  return { auth };
}
