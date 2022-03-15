import { ModelBase } from "@domain.js/main/dist/deps/sequelize";
import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";
import * as otplib from "otplib";

import { Cnf } from "../../../configs";
import type { TDeps } from "../../deps";

export const Deps = [
  "_",
  "U",
  "aes",
  "cia",
  "Sequelize",
  "utils",
  "sequelize",
  "consts",
  "parallel",
] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export interface Attrs {
  id: number;
  name: string;
  avatar: string;
  mobile: string;
  status: "enabled" | "disabled";
  role: "admin" | "member";
  password?: string;
  secret?: string;
  salt?: string;
  loginTimes: number;
  maxDiskMB: number;
  usedDiskMB: number;
  maxDocsNum: number;
  usedDocsNum: number;
  lastSignedAt?: Date;
  deletorId?: number;
  isDeleted?: "yes" | "no";
}
type Attrs4Create = Omit<Attrs, "id">;

export function Main(cnf: Cnf, deps: Deps) {
  const {
    aes: { key: AES_KEY },
    upload: { accessUrl },
  } = cnf;
  if (!AES_KEY) throw Error("请先设置 aes.key 值");

  const {
    _,
    aes,
    U: { randStr, nt2space, md5 },
    Sequelize,
    sequelize: { db: sequelize },
    consts: { USER_PROTECT_FIELDS },
  } = deps;

  const { DataTypes } = Sequelize;

  /** 重置安全信息的参数格式定义 */
  interface Params {
    /** 密码 */
    password?: string;
    /** 密码扰码 */
    salt?: string;
    /** Google 二次验证私钥 */
    secret?: string;
  }

  class User extends ModelBase<Attrs, Attrs4Create> implements Attrs {
    public id!: number;
    public name!: string;
    public avatar!: string;
    /* 用户手机号码 */
    public mobile!: string;
    public password?: string;
    public secret?: string;
    public salt!: string;
    public status!: "enabled" | "disabled";
    public role!: "admin" | "member";
    public loginTimes!: number;
    public lastSignedAt?: Date;
    public maxDiskMB!: number;
    public usedDiskMB!: number;
    public maxDocsNum!: number;
    public usedDocsNum!: number;
    public deletorId?: number;
    public isDeleted?: "yes" | "no";
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static allowIncludeCols = [];
    static writableCols = ["name", "mobile", "password", "salt", "maxDiskMB", "maxDocsNum"];
    static editableCols = ["name", "avatar", "password", "salt", "maxDiskMB", "maxDocsNum"];
    static onlyAdminCols = ["maxDiskMB", "maxDocsNum"];
    static sort = {
      default: "id",
      defaultDirection: "DESC" as const,
      allow: ["id", "createdAt", "updatedAt"],
    };

    static password(passwordMD5: string, salt: string) {
      return md5(`${passwordMD5}${salt}`);
    }

    static resetSecurity(params: Params, resetSecret = false) {
      if (params.password) {
        params.password = md5(params.password);
        params.salt = randStr(20, "normal");
        params.password = User.password(params.password, params.salt);
      }

      let secret;
      if (resetSecret) {
        secret = otplib.authenticator.generateSecret();
        params.secret = aes.encrypt(secret, AES_KEY as string);
      }

      return secret;
    }

    async changeFiled(field: "name", value: string): Promise<void>;
    async changeFiled(field: "status", value: "enabled" | "disabled"): Promise<void>;
    async changeFiled(field: "role", value: "admin" | "member"): Promise<void>;
    async changeFiled(field: "name" | "status" | "role", value: any): Promise<void> {
      this.set(field, value);
      await this.save({ fields: [field] });
    }

    toJSON() {
      return _.omit(this.get(), USER_PROTECT_FIELDS);
    }
  }

  User.init(
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
        validate: {
          len: [1, 64],
        },
      },
      avatar: {
        type: DataTypes.STRING,
        get() {
          const val = this.getDataValue("avatar");
          if (!val) return undefined;
          return `${accessUrl}/${val}`;
        },
        comment: "用户头像对应的文件ID",
      },
      secret: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: true,
        comment: "Google 二次验证，安全码, aes 加密存储",
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
        allowNull: true,
        comment: "密码，混淆密码存储",
      },
      salt: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: true,
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
        values: ["admin", "member"],
        defaultValue: "member",
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
      maxDiskMB: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        comment: "允许的最大空间大小(MB)",
      },
      usedDiskMB: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        comment: "已使用的磁盘空间大小(MB)",
      },
      maxDocsNum: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        comment: "允许上传的文档最大数",
      },
      usedDocsNum: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        comment: "已上传的文档数量",
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
      hooks: {
        beforeCreate(instance) {
          instance.salt = randStr(20, "normal");
        },
      },
    },
  );

  return User;
}
