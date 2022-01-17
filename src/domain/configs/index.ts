import * as path from "path";
import { Cfg } from "@domain.js/main";
import { schema } from "./cnf.schema";

const cfg = Cfg(process.env, schema);

const storagePath = cfg("STORAGE_PATH") || path.resolve(__dirname, "../../../storage");

type VERBS = ("post" | "get" | "put" | "patch" | "delete")[];
export const cnf = {
  features: [
    "aes" /** AES 加解密模块 */,
    "request" /** axios 封装后的模块 */,
    "cache" /** 内存级 LRU cache 模块 */,
    "checker" /** 常见的检测功能模块 */,
    "myCia" /** 轻量级任务模块，取代传统的事件处理 */,
    "counter" /** 基于 redis hash 数据类型的计数器模块 */,
    "cron" /** 计划任务模块，周期性任务模块 */,
    "graceful" /** 优雅重启相关模块 */,
    "hash" /** 基于 redis hash 数据类型的存储模块 */,
    "logger" /** 日志相关处理模块 */,
    "parallel" /** 并发控制模块 */,
    "redis" /** redis 模块，已建立链接的 redis 对象，基于 ioredis 库包 */,
    "rest" /** 标准 Restful CRUD 模块 */,
    "schema" /** 基于 ajv 的 json-schema 验证模块 */,
    "sequelize" /** 基于 Sequelize 的数据库连接，支持多数据库 */,
    "signer" /** 加密通信的签名算法 */,
  ] as const,

  // 系统主域名
  domain: cfg("DOMAIN"),

  // cache 配置, 参考 https://github.com/isaacs/node-lru-cache
  cache: {
    isMulti: true,
    max: 5000,
  },

  // 模式，手动模式下，一切自动执行的脚本需要停止
  mode: cfg("MODE") || "auto",

  // schema 通用模块配置
  schema: {
    allowUnionTypes: true,
    coerceTypes: true,
    useDefaults: true,
  },

  // @domain.js/axios 配置信息
  axios: {
    loggers: ["post", "get", "put", "delete"] as VERBS,
    retry: ["post", "get"],
    retryTimes: 3,
    retryIntervalMS: 10 * 1000,
    conf: {
      // defines the max size of the http response content in bytes allowed
      maxContentLength: 100 * 1024 * 1024,
      // defines the max size of the http request content in bytes allowed
      maxBodyLength: 100 * 1024 * 1024,
    },
  },

  // 并发控制的设置
  parallel: {
    // 并发控制的key, 存储单元
    key: "parallel-control",
    // 超过多长时间会被清理
    defaultErrorFn: (p: any) => Error(`并发控制，禁止同一时间多次请求: ${p}`),
  },

  // 计数器相关设置
  counter: {
    key: "counters",
  },

  // 通用 redis hash 设置相关
  hash: {
    key: "hashs",
  },

  aes: {
    key: cfg("AES_KEY"),
  },

  /** 数据库配置 */
  sequelize: {
    db: {
      host: cfg("DB_HOST") || "127.0.0.1",
      port: Number(cfg("DB_PORT")) || 3306,
      database: cfg("DB_NAME") || "redstone",
      username: cfg("DB_USER") || "root",
      password: cfg("DB_PASS"),
      dialect: "mysql",
      dialectOptions: {
        /** 支持大数的计算 */
        supportBigNumbers: true,
        charset: "utf8mb4",
      },
      logging(str: string, opt: any) {
        console.log(str);
        if (opt && opt.bind) console.log(opt.bind);
      },
      define: {
        underscored: false,
        freezeTableName: true,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
        engine: "InnoDB",
      },
      pool: {
        min: 2,
        max: 10,
        /** 单位毫秒 */
        idle: 300 * 1000,
      },
    },
  } as const,

  /** redis 配置信息, 使用 ioredis 的options格式 */
  redis: {
    host: cfg("REDIS_HOST") || "127.0.0.1",
    port: Number(cfg("REDIS_PORT")) || 6379,
    keyPrefix: cfg("REDIS_PRE") || "DJD::",
  },

  /** 文件上传的若干设定 */
  upload: {
    /** 文件存储路径 */
    dir: cfg("UPLOAD_DIR") || path.resolve(storagePath, "files"),

    /**
     * 不允许的后缀，包括压缩包里的，如果要求解压的时候也要判断
     * 一旦有不和发的直接报错
     */
    blackList: new Set([
      ".php",
      ".html",
      ".js",
      ".htm",
      ".shtml",
      ".css",
      ".xml",
      ".mml",
      ".jad",
      ".wml",
      ".htc",
      ".odt",
    ]),

    /** 文件下载路径 */
    accessUrl: `${cfg("CDN_ROOT")}/upload-files`,
  },

  logger: {
    errorLogPath: `${storagePath}/logs`,
    infoLogPath: `${storagePath}/logs`,
    clientId: `ghada-api-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  },

  rest: {
    relativeMaxRangeDays: 90,
  },

  /** 日期格式化的格式 */
  dateFormat: "YYYY-MM-DD",

  /** 时间格式化的格式 */
  dateTimeFormat: "YYYY-MM-DD HH:mm:ss",

  /** 允许的语言 */
  languages: ["zh", "en", "zh-tw"],
  defaultLanguage: "zh",
};

export type Cnf = typeof cnf;
