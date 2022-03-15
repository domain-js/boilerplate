// 系统内Model的名称列表
export const MODELS = ["Auth", "User", "File", "Notice"] as const;

/** 用户信息需要保护的字段 */
export const USER_PROTECT_FIELDS = ["password", "salt", "secret"] as const;

/** Worker 信息需要保护的字段 */
export const WORKER_PROTECT_FIELDS = ["secret"] as const;

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
export const TOKEN_LIFE_SECONDS = 180 * 86400;

// 密码错误次数, 超出锁定 IP 一段时间
export const LOGIN_ERROR_TIMES_MAX = 5;

// 错误超过次数，锁定 IP 时间，单位秒
export const LOGIN_ERROR_LOCK_IP_SECONDS = 30 * 60;

// CACHE 有效期 单位 毫秒
export const CACHE_LIFE_MS = {
  MODEL_GET_BY_PK: 3 * 60 * 60 * 1000,
  AUTH_READ_USER_BY_TOKEN: 12 * 60 * 60 * 1000,
} as const;

// 验证码相关设置
/** 验证码长度 */
export const MOBILE_VERIFY_CODE_LENGTH = 6;
/** 验证码取值范围 */
export const MOBILE_VERIFY_CODE_RANGE = "0123456789";
/** 验证码有时间，单位毫秒 */
export const MOBILE_VERIFY_CODE_LIFE_MS = 10 * 60 * 1000;
/** 同类型验证码两次发送最小时间间隔，单位毫秒 */
export const MOBILE_VERIFY_CODE_PARALLEL_MIN_GAP_MS = 3 * 60 * 1000;

/** 图片缩放处理尺寸 */
export const RESIZE_IMAGES: Record<"product" | "avatar", [number, number]> = {
  product: [760, 360],
  avatar: [120, 120],
};

/** 签名认证，时间差异最大值 */
export const SIGN_AUTH_TIMESTAMP_MAX_GAP_MS = 5 * 60 * 1000;
