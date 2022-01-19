// 系统内Model的名称列表
export const MODELS = ["Auth", "User"] as const;

// 用户信息需要保护的字段
export const USER_PROTECT_FIELDS = ["password", "salt"] as const;

// 用户敏感信息key，仅管理员可查看
export const USER_SECRET_INFO_KEYS = [
  "status",
  "loginTimes",
  "lastSignedAt",
  "deletorId",
  "mobile",
  "role",
] as const;

/** token 有效期, 单位秒 */
export const TOKEN_LIFE_SECONDS = 7 * 86400;

// 密码错误次数, 超出锁定 IP 一段时间
export const LOGIN_ERROR_TIMES_MAX = 5;

// 错误超过次数，锁定 IP 时间，单位秒
export const LOGIN_ERROR_LOCK_IP_SECONDS = 30 * 60;

// CACHE 有效期 单位 毫秒
export const CACHE_LIFE_MS = {
  MODEL_GET_BY_PK: 3 * 60 * 60 * 1000,
  AUTH_READ_USER_BY_TOKEN: 12 * 60 * 60 * 1000,
} as const;
