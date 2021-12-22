// 并发控制
/**
 * sample
 * key 登录接口
  "auth.add": [
    [
    // 第一项为keyFn 用来计算并发控制的唯一key值
    (path, profile) => `${path}-${profile.realIp}`,
    // 第二项为最低耗时，保证并发控制单个执行时长不低于该值, 大于0是生效
    0 * 1000
    // 第三项为错误处理函数, 返回必须是 Error 的实例
    ],
    // 是否需要等待执行, 登录轮询的时间, 单位毫秒
    100
  ]
*/

import { Profile } from "@domain.js/main/dist/http/defines";

interface ParallelFn {
  [k: string]: {
    keyFn: (path: string, profile: Profile, params: any) => string;
    minMS: number;
  };
}

const fns: ParallelFn = {
  // key domain 方法路径
  "auth.add": {
    keyFn(path, { realIp }) {
      return `${path}-${realIp}`;
    },
    minMS: 1 * 1000,
  },
  "user.modify": {
    keyFn(path, _, { id }) {
      return `${path}-${id}`;
    },
    minMS: 1 * 1000,
  },
  "user.changeMobile": {
    keyFn(path, _, { id }) {
      return `${path}-${id}`;
    },
    minMS: 10 * 1000,
  },
  "user.nameExists": {
    keyFn(path, { realIp }) {
      return `${path}-${realIp}`;
    },
    minMS: 5 * 1000,
  },
  "user.mobileExists": {
    keyFn(path, { realIp }) {
      return `${path}-${realIp}`;
    },
    minMS: 5 * 1000,
  },
};

export default fns;
