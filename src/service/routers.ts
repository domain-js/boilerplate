import { Router } from "@domain.js/main/dist/http/router";

/**
 * api route 定义，之所以需要这个文件
 * 是希望有一个统一的地方可以清晰的看到所有的路由配置
 * 方便开发人员快速的查找定位问题
 */

export function routers(r: ReturnType<typeof Router>) {
  /** 首页默认路由 */
  r.get("/", "home.index");
  r.post("/", "home.index");

  /** 用户登陆接口 */
  r.post("/session", "auth.add", 201);
  /** 用户退出接口 */
  r.del("/session", "auth.remove", 204);
  /** 用户查看自身信息接口 */
  r.get("/session", "auth.detail");

  /** 用户接口 */
  r.resource("user");
  r.put("/users/:id/status/:value", "user.changeStatus");
  r.put("/users/:id/role/:value", "user.changeRole");
}
