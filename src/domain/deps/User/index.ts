import { ModelExtraAtts } from "@domain.js/main/dist/deps/rest/defines";
import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";
import type { TDeps } from "../../deps";

export const Deps = [
  "_",
  "U",
  "cia",
  "Sequelize",
  "ModelBase",
  "utils",
  "sequelize",
  "consts",
  "parallel",
] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export interface Attrs {
  id: number;
  name: string;
  mobile: string;
  password: string;
  salt: string;
  status: "enabled" | "disabled";
  role: "admin" | "member";
  loginTimes: number;
  lastSignedAt?: Date;
  deletorId?: number;
  isDeleted?: "yes" | "no";
}
type Attrs4Create = Omit<Attrs, "id">;

export function Main(cnf: any, deps: Deps) {
  const {
    _,
    U: { randStr, nt2space, md5 },
    ModelBase,
    Sequelize,
    sequelize: { db: sequelize },
    consts: { USER_PROTECT_FIELDS },
  } = deps;

  const { DataTypes } = Sequelize;

  class Model extends ModelBase<Attrs, Attrs4Create> implements Attrs {
    public id!: number;
    public name!: string;
    /* 用户手机号码 */
    public mobile!: string;
    public password!: string;
    public salt!: string;
    public status!: "enabled" | "disabled";
    public role!: "admin" | "member";
    public loginTimes!: number;
    public lastSignedAt?: Date;
    public deletorId?: number;
    public isDeleted?: "yes" | "no";
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static password(passwordMD5: string, salt: string) {
      return md5(`${passwordMD5}${salt}`);
    }

    static genSaltAndPassword(password: string) {
      const salt = randStr(16, "normal");

      return { salt, password: this.password(md5(password), salt) };
    }

    async changeFiled(field: "name", value: string): Promise<void>;
    async changeFiled(field: "mobile", value: string): Promise<void>;
    async changeFiled(field: "status", value: "enabled" | "disabled"): Promise<void>;
    async changeFiled(field: "role", value: "admin" | "member"): Promise<void>;
    async changeFiled(field: "name" | "mobile" | "status" | "role", value: any): Promise<void> {
      this.set(field, value);
      await this.save({ fields: [field] });
    }

    toJSON() {
      return _.omit(this.get(), USER_PROTECT_FIELDS) as any;
    }
  }
  Model.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        // 成员名称 name
        type: DataTypes.STRING(64),
        allowNull: true,
        set(val: string) {
          (this as any).setDataValue("name", nt2space(val));
        },
        unique: true,
        validate: {
          len: [1, 64],
        },
      },
      mobile: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
          len: [5, 20],
        },
        comment: "手机号码",
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "密码，混淆密码存储",
      },
      salt: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "密码混淆，随机串",
      },
      status: {
        type: DataTypes.ENUM,
        values: ["enabled", "disabled"],
        defaultValue: "enabled",
        comment: "用户是否被禁用",
      },
      role: {
        type: DataTypes.ENUM,
        values: ["admin", "volunteer"],
        defaultValue: "volunteer",
        allowNull: false,
      },
      loginTimes: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: "登录次数",
      },
      lastSignedAt: {
        type: DataTypes.DATE,
        comment: "上次登录时间",
      },
      deletorId: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        comment: "删除操作者ID",
      },
      isDeleted: {
        type: DataTypes.ENUM,
        values: ["yes", "no"],
        defaultValue: "no",
        allowNull: false,
        comment: "是否被删除",
      },
    },
    {
      sequelize,
      comment: "用户表",
      freezeTableName: true,
      modelName: "User",
      tableName: "user",
      initialAutoIncrement: "10000",
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
      defaultDirection: "DESC",
      allow: ["id", "createdAt", "updatedAt"],
    },
  };

  return Object.assign(Model, Expandeds);
}
