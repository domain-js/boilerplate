import { ModelBase } from "@domain.js/main/dist/deps/sequelize";

import type { Attrs as UserAttrs } from "../User";
import type { Deps } from "./Deps";

export { After } from "./After";
export { Deps } from "./Deps";

interface Attrs {
  id: number;
  token: string;
  deviceId?: string;
  expiredAt: Date;
  onlineIp: string;
  creatorId: number;
}

type Attrs4Create = Omit<Attrs, "id">;

export function Main(cnf: any, deps: Deps) {
  const {
    redis,
    utils: { randStr, generateId },
    Sequelize,
    sequelize: { db: sequelize },
    User,
    errors,
    consts,
  } = deps;
  const { DataTypes } = Sequelize;

  class Auth extends ModelBase<Attrs, Attrs4Create> implements Attrs {
    public id!: number;
    public token!: string;
    public deviceId?: string;
    public expiredAt!: Date;
    public onlineIp!: string;
    public creatorId!: number;

    static allowIncludeCols = [];
    static writableCols = [];
    static editableCols = [];
    static sort = {
      default: "id",
      allow: ["id", "name", "updatedAt", "createdAt"],
    };

    /**
     * 生成一个 授权 auth
     * @param user 用户
     * @param onlineIp 用户 ip
     * @param deviceId 用户设备 ID
     */
    static generate(user: UserAttrs, onlineIp: string, deviceId?: string) {
      return Auth.create({
        token: `user_${randStr(64, "normal")}`,
        expiredAt: new Date(Date.now() + 1000 * (consts.TOKEN_LIFE_SECONDS || 1 * 86400)),
        deviceId,
        onlineIp,
        creatorId: user.id,
      });
    }

    /**
     * 读取 user session 通过token
     * @param token token 字符串
     */
    static async readUserByToken(token: string) {
      const auth = await Auth.findOne({ where: { token } });
      if (!auth) throw errors.tokenError(token);
      if (auth.expiredAt < new Date()) throw errors.tokenError(token);
      const user = await User.findByPk(auth.creatorId);
      if (!user) throw errors.tokenErrorUserNotExisits(token);
      if (user.status === "disabled")
        throw errors.tokenErrorUserStatusDisabled(user.id, user.status);
      if (user.isDeleted === "yes") throw errors.tokenErrorUserBeenDeleted(user.id);
      const json = Object.assign(user.toJSON(), {
        viewerId: "",
        auth: auth.toJSON(),
        token,
        _type: <const>"user",
        _id: `user-${user.id}`,
      });

      return json;
    }

    /**
     * 获取 session 在 redis 里的 key, 基于 token
     * @param token
     */
    static cacheKey(token: string) {
      return `LoginToken: ${token}`;
    }

    /**
     * 读取 cache 里的 session 信息，基于 token
     * @param token token 字符串
     */
    static async readSessionFromCache(token: string) {
      const val = await redis.get(Auth.cacheKey(token));
      if (!val) throw errors.tokenError();
      return JSON.parse(val) as Awaited<ReturnType<typeof Auth.readUserByToken>>;
    }

    /**
     * 更新cache里的token
     * @param session 要更新的 session 数据
     */
    static async updateSession(session: { token: string }) {
      const key = Auth.cacheKey(session.token);
      await redis.update(key, JSON.stringify(session));
    }
  }

  Auth.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: "存放 token",
      },
      deviceId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "设备唯一标识",
      },
      expiredAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "过期时间",
      },
      onlineIp: {
        type: DataTypes.STRING(15),
        allowNull: false,
        comment: "创建者即登陆者IP",
      },
      creatorId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "创建者，即关联用户",
      },
    },
    {
      sequelize,
      comment: "登陆授权表",
      freezeTableName: true,
      modelName: "Auth",
      tableName: "auth",
      hooks: {},
    },
  );

  return Auth;
}

export type Session = ReturnType<ReturnType<typeof Main>["readUserByToken"]> extends Promise<
  infer R
>
  ? R
  : never;
