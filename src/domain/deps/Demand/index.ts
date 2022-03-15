import { ModelBase } from "@domain.js/main/dist/deps/sequelize";
import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";

import type { TDeps } from "../../deps";
import { errors } from "../../errors";

export const Deps = [
  "_",
  "U",
  "cia",
  "Sequelize",
  "utils",
  "sequelize",
  "consts",
  "parallel",
] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export interface Attrs {
  /** 主键id，自增长，自动生成 */
  id: number;
  /** 关联用户ID */
  userId?: number;
  /** 接收地址，手机号码或者email */
  to: string;
  /** 验证类型 */
  type: string;
  /** 是否已使用 */
  used: "yes" | "no";
  /** 验证码 */
  code: string;
  /** 发送任务ID */
  taskId?: string;
  /** 发送时间 */
  sentAt?: Date;
  /** 验证码过期时间 */
  expiredAt?: Date;
}
type Attrs4Create = Omit<Attrs, "id">;

export function Main(cnf: any, deps: Deps) {
  const {
    _,
    utils: { randStr },
    Sequelize,
    consts: {
      MOBILE_VERIFY_CODE_LENGTH,
      MOBILE_VERIFY_CODE_LIFE_MS,
      MOBILE_VERIFY_CODE_RANGE,
      MOBILE_VERIFY_CODE_PARALLEL_MIN_GAP_MS,
    },
    sequelize: { db: sequelize },
  } = deps;

  const { DataTypes } = Sequelize;

  class Demand extends ModelBase<Attrs, Attrs4Create> implements Attrs {
    public id!: number;
    public to!: string;
    public userId?: number;
    public type!: string;
    public used!: "yes" | "no";
    public code!: string;
    public taskId!: string;
    public expiredAt!: Date;
    public sendAt?: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static allowIncludeCols = [];
    static writableCols = ["to", "userId", "type"];
    static editableCols = [];
    static sort = {
      default: "id",
      defaultDirection: "DESC" as const,
      allow: ["id"],
    };

    /**
     * 验证请求码是否正确
     * @param to 接收方
     * @param code 收到的码
     * @param type 请求的类型
     */
    static async verify(to: string, code: string, type: string) {
      if (process.env.NODE_ENV === "development" && code === "CAIXXX") return;
      const item = await this.findOne({
        where: {
          type,
          to,
          code,
          used: "no",
        },
      });
      if (!item) throw errors.demandVerifyCodeError(code);
      if (item.expiredAt < new Date()) throw errors.demandVerifyCodeError(code);
      const [affected] = await this.update({ used: "yes" }, { where: { id: item.id } });
      if (affected !== 1) throw errors.demandVerifyCodeError(code);
    }
  }

  Demand.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: "关联用户",
      },
      to: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: "对应的手机或者email",
      },
      type: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: "申请类型",
      },
      used: {
        type: DataTypes.ENUM,
        values: ["no", "yes"],
        defaultValue: "no",
        comment: "是否已被使用, 申请只能使用一次",
      },
      code: {
        type: DataTypes.STRING(10),
        comment: "验证的码值",
      },
      taskId: {
        type: DataTypes.STRING(255),
        comment: "对应的发送短信或者email的任务ID",
      },
      sentAt: {
        type: DataTypes.DATE,
        comment: "发送时间",
      },
      expiredAt: {
        type: DataTypes.DATE,
        comment: "过期时间",
      },
    },
    {
      sequelize,
      comment: "用户发起的请求",
      freezeTableName: true,
      modelName: "Demand",
      tableName: "demand",
      initialAutoIncrement: "10000",
      hooks: {
        async beforeCreate(instance: Demand) {
          const last = await Demand.findOne({
            where: _.pick(instance, ["to", "type"]),
            order: [["id", "DESC"]],
          });
          if (
            last &&
            Date.now() - last.createdAt.valueOf() < MOBILE_VERIFY_CODE_PARALLEL_MIN_GAP_MS
          )
            throw errors.notAllowed("请三分钟后在尝试");

          instance.code = randStr(MOBILE_VERIFY_CODE_LENGTH, MOBILE_VERIFY_CODE_RANGE);
          // 自动设置有效期
          instance.expiredAt = new Date(Date.now() + MOBILE_VERIFY_CODE_LIFE_MS);
        },
      },
    },
  );

  return Demand;
}
