import { ModelExtraAtts } from "@domain.js/main/dist/deps/rest/defines";
import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";
import type { TDeps } from "../../deps";

export const Deps = ["consts", "utils", "errors", "cia", "User", "sequelize", "Sequelize"] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

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
    utils: { randStr },
    Sequelize,
    sequelize: { db: sequelize },
    User,
    errors,
    consts,
  } = deps;
  const { DataTypes } = Sequelize;

  class Model extends Sequelize.Model<Attrs, Attrs4Create> implements Attrs {
    public id!: number;
    public token!: string;
    public deviceId?: string;
    public expiredAt!: Date;
    public onlineIp!: string;
    public creatorId!: number;

    static generate(user: User, onlineIp: string, deviceId?: string) {
      return Model.create({
        token: `user_${randStr(64, "normal")}`,
        expiredAt: new Date(Date.now() + 1000 * (consts.TOKEN_LIFE_SECONDS || 1 * 86400)),
        deviceId,
        onlineIp,
        creatorId: user.id,
      });
    }

    static async readUserByToken(token: string) {
      const auth = await Model.findOne({ where: { token } });
      if (!auth) throw errors.tokenError(token);
      if (auth.expiredAt < new Date()) throw errors.tokenError(token);
      const user = await User.getByPk(auth.creatorId);
      if (!user) throw errors.tokenErrorUserNotExisits(token);
      if (user.status === "disabled")
        throw errors.tokenErrorUserStatusDisabled(user.id, user.status);
      if (user.isDeleted === "yes") throw errors.tokenErrorUserBeenDeleted(user.id);
      const json = user.toJSON();
      json.auth = auth.toJSON();
      json.token = token;
      json._type = "user";
      json._id = `user-${json.id}`;

      return json;
    }
  }

  Model.init(
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

  // Model 补充定义
  const Expandeds: ModelExtraAtts = {
    allowIncludeCols: [],
    writableCols: ["name", "mobile", "password", "salt"],
    editableCols: ["name", "password", "salt"],
    sort: {
      default: "id",
      allow: ["id", "name", "updatedAt", "createdAt"],
    },
  };

  return Object.assign(Model, Expandeds);
}