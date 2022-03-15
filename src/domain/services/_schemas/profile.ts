export { Profile } from "@domain.js/main/dist/http/defines";

export const profile = {
  title: "profile 参数设定",
  type: "object",
  required: ["clientIp", "remoteIp", "realIp"],
  properties: {
    // 这个地址是完全读取的头信息，可能是最真实的，但是最不可信的
    clientIp: {
      description: "客户端真实ip地址",
      type: "string",
    },
    // 这个地址一般是nginx代理的地址
    remoteIp: {
      description: "直接建立连接IP地址",
      type: "string",
    },
    // 这个地址是授信nginx代理头信息传递过来的
    // 私有ip客户端应该基于此ip来判断
    realIp: {
      description: "可信任的真实ip",
      type: "string",
    },
    token: {
      description: "用户授权身份token",
      type: "string",
    },
    sign: {
      description: "签名认证相关信息",
      type: "object",
      required: ["signature", "uri", "key", "timestamp", "signMethod", "signVersion"],
      properties: {
        signature: {
          description: "请求验证签名",
          type: "string",
        },
        uri: {
          description: "请求uri",
          type: "string",
        },
        key: {
          description: "client key",
          type: "string",
        },
        timestamp: {
          description: "请求时间戳, 秒级",
          type: "integer",
        },
        signMethod: {
          description: "签名算法名称",
          type: "string",
        },
        signVersion: {
          description: "签名算法版本",
          type: "string",
        },
      },
    },
  },
};
