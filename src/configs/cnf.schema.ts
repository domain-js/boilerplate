export const schema = {
  description: "Config data schema definition",
  type: "object",
  required: ["AES_KEY"],
  properties: {
    NODE_ENV: {
      description: "进程启动环境",
      type: "string",
      enum: ["production", "development", "test"],
    },

    // web 服务相关
    HTTP_PORT: {
      description: "进程启动web服务端口",
      type: "integer",
    },
    HTTP_HOST: {
      description: "进程启动监听的IP地址",
      type: "string",
    },
    PROXY_IPS: {
      description: "web服务反向代理模式下的代理服务器IP地址，多个用逗号分隔",
      type: "string",
    },

    MODE: {
      description: "执行模式，auto, hand 可选，hand 的情况下, 不会执行自动任务",
      type: "string",
      enum: ["hand", "auto"],
    },
    DOMAIN: {
      description: "站点主域名",
      type: "string",
    },

    STORAGE_PATH: {
      description: "存储主目录",
      type: "string",
    },
    AES_KEY: {
      description:
        "站点重要信息加密，秘钥, 避免外泄和丢失，丢失无法找回，所有的加密存储的信息需要重新设定",
      type: "string",
      minLength: 16,
      maxLength: 64,
    },

    DB_HOST: {
      description: "数据库地址",
      type: "string",
    },
    DB_PORT: {
      description: "数据库端口",
      type: "integer",
    },
    DB_NAME: {
      description: "数据库名称",
      type: "string",
      minLength: 1,
    },
    DB_USER: {
      description: "数据库用户名",
      type: "string",
    },
    DB_PASS: {
      description: "数据库访问密码",
      type: "string",
      minLength: 10,
      maxLength: 30,
    },

    REDIS_HOST: {
      description: "Redis 地址",
      type: "string",
    },
    REDIS_PORT: {
      description: "Redis 端口",
      type: "integer",
    },
    REDIS_PRE: {
      description: "Redis 前缀，用来隔离不同项目的数据",
      type: "string",
      minLength: 1,
      maxLength: 20,
    },
    UPLOAD_DIR: {
      description: "上传文件存储目录",
      type: "string",
    },
    CDN_ROOT: {
      description: "cdn 地址",
      type: "string",
    },
  },
};
