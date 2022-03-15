import { ModelBase } from "@domain.js/main/dist/deps/sequelize";
import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";

import { Cnf } from "../../../configs";
import type { TDeps } from "../../deps";

export { After } from "./After";

export const Deps = ["Sequelize", "utils", "sequelize", "cia"] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export type NoticeType =
  /** 接收到一条私信 */
  | "receivedMsg"
  /** 发送一条私信 */
  | "sentMsg";

export interface Attrs {
  /** 主键id，随机生成，自动生成 */
  id: string;
  /** 所属用户ID */
  userId: number;
  /** 通知状态 */
  status: "read" | "unread";
  /** 通知类型 */
  type: NoticeType;
  /** 关联目标类型 */
  targetType: "none";
  /** 关联目标唯一ID */
  targetId?: string;
  /** 通知提醒内容 */
  content: string;
  /** 对话的另一方，对 type=receivedMsg 来说是发送者，type=sentMsg 来说是接受者 */
  interlocutorId: number;
}

export function Main(cnf: Pick<Cnf, "upload">, deps: Deps) {
  const {
    cia,
    utils: { generateId },
    Sequelize,
    sequelize: { db: sequelize },
  } = deps;

  const { DataTypes } = Sequelize;

  class Notice extends ModelBase<Attrs, Omit<Attrs, "id">> implements Attrs {
    public id!: string;
    public userId!: number;
    public type!: NoticeType;
    public status!: "read" | "unread";
    public targetType!: "none";
    public targetId?: string;
    public content!: string;
    public interlocutorId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static allowIncludeCols = undefined;
    static writableCols = ["userId", "type", "targetType", "targetId", "content", "interlocutorId"];
    static editableCols = ["status"];
    static sort = {
      default: "id",
      defaultDirection: "DESC" as const,
      allow: ["createdAt"],
    };

    static async setReadByUserId(userId: number) {
      const where = { userId, status: "unread" };
      const [effected] = await Notice.update({ status: "read" }, { where, individualHooks: true });
      return effected;
    }
  }

  Notice.init(
    {
      id: {
        type: DataTypes.STRING(25),
        primaryKey: true,
        comment: "主键ID，随机生成，ppt_开头",
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: "关联用户",
      },
      status: {
        type: DataTypes.ENUM("read", "unread"),
        defaultValue: "unread",
        comment: "阅读状态",
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "提醒类型",
      },
      targetType: {
        type: DataTypes.STRING,
        defaultValue: "none",
        comment: "关联目标类型",
      },
      targetId: {
        type: DataTypes.STRING,
        comment: "关联目标ID",
      },
      content: {
        type: DataTypes.TEXT,
        comment: "消息提醒内容",
      },
      interlocutorId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: "对话的另一方用户 ID",
      },
    },
    {
      sequelize,
      comment: "notice 通知,提醒 表",
      freezeTableName: true,
      modelName: "Notice",
      tableName: "notice",
      hooks: {
        async beforeCreate(instance) {
          instance.id = generateId("ntc_", 25);
          // 发出的消息默认为已读
          if (instance.type === "sentMsg") instance.status = "read";
        },
        async afterCreate(instance) {
          const json = instance.toJSON();
          // 发送消息的时候自动生成一条接收消息的
          if (json.type === "sentMsg") {
            json.id = generateId("ntc_", 25);
            json.userId = instance.interlocutorId;
            json.status = "unread";
            json.interlocutorId = instance.userId;
            json.type = "receivedMsg";
            await Notice.create(json);
          } else {
            // socket 推送出去
            cia.submit("socket.push", ["single", instance.userId, "notice", json]);
          }
        },
      },
    },
  );

  return Notice;
}
