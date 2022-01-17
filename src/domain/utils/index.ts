import { utils } from "@domain.js/main";

export default Object.assign(utils, {
  // TODO 项目自定义的工具方法
  test(a: string) {
    return `A: ${a}`;
  },
});
