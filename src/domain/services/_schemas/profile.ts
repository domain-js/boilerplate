export type Profile = {
  /** 客户端真实 ip, 不可用于权限等判断，改ip可以伪造 */
  clientIp: string,

  /** 直接建立连接 ip */
  remoteIp: string,

  /** 这个地址是授信nginx代理头信息传递过来的, 私有ip客户端应该基于此ip来判断 */
  realIp: string,

  /** token 可选 */
  token?: string,
};

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
  },
};
