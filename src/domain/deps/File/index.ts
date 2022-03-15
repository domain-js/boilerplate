import { ModelBase } from "@domain.js/main/dist/deps/sequelize";
import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";
import * as GM from "gm";
import * as path from "path";

import { Cnf } from "../../../configs";
import type { TDeps } from "../../deps";

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
  /** 主键id，随机生成，自动生成 */
  id: number;
  /** 文档名称 */
  name: string;
  /** 文件后缀 */
  extension: string;
  /** 文件存储路径 */
  path: string;
  /** 文件大小 */
  bytes: number;
  /** 文件创建者 */
  creatorId: number;
  /** 缩略图生成时间 */
  resizedAt: Date;
}
type Attrs4Create = Omit<Attrs, "id">;

export function Main(cnf: Pick<Cnf, "upload">, deps: Deps) {
  const gm = GM.subClass({ imageMagick: true });
  const {
    upload: { accessUrl, dir: UPLOAD_DIR },
  } = cnf;
  const {
    utils: { nt2space },
    Sequelize,
    sequelize: { db: sequelize },
  } = deps;

  const { DataTypes } = Sequelize;

  class File extends ModelBase<Attrs, Attrs4Create> implements Attrs {
    public id!: number;
    public name!: string;
    public extension!: string;
    public path!: string;
    public bytes!: number;
    public creatorId!: number;
    public resizedAt!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static allowIncludeCols = [];
    static writableCols = ["name", "path", "bytes", "extension"];
    static editableCols = [];
    static sort = {
      default: "id",
      defaultDirection: "DESC" as const,
      allow: ["id"],
    };

    /**
     * 判断某个文件是否为图片
     * @param source 文件路径
     * @returns
     */
    static isImage(source: string): Promise<Boolean> {
      return new Promise((resolve) => {
        gm(source).size((err) => {
          resolve(!err);
        });
      });
    }

    /**
     * 生成缩略图
     * @param source 源文件路径
     * @param type 类型名称
     * @param size 缩略图尺寸
     */
    static async resize(
      source: string,
      type: string,
      size: [width: number, height: number],
    ): Promise<string> {
      const target = `${source}-${type}.jpeg`;
      return new Promise((resolve, reject) => {
        gm(source)
          .autoOrient()
          .resize(size[0], size[1])
          .noProfile()
          .setFormat("JPEG")
          .quality(85)
          .strip()
          .write(target, (err) => {
            if (err) return reject(err);
            return resolve(target);
          });
      });
    }

    /**
     * 获取文件的本地访问路径
     */
    static localPath(file: File) {
      return path.resolve(UPLOAD_DIR, file.getDataValue("path"));
    }
  }

  File.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        set(val: string) {
          return this.setDataValue("name", nt2space(val));
        },
        validate: {
          len: [1, 100],
        },
        comment: "文件名",
      },
      extension: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 20],
        },
        comment: "文件类型",
      },
      path: {
        type: DataTypes.STRING,
        get() {
          return `${accessUrl}/${this.getDataValue("path")}`;
        },
        comment: "文件路径",
      },
      bytes: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: "文件所占字节数",
      },
      resizedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: "1970-01-01",
        comment: "处理缩略图的时间",
      },
      creatorId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "创建者ID",
      },
    },
    {
      sequelize,
      comment: "文件表",
      freezeTableName: true,
      modelName: "File",
      tableName: "file",
      hooks: {},
    },
  );

  return File;
}
