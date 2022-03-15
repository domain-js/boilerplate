import { NarrowDomainPaths } from "@domain.js/main/dist/http/router";

import { DomainPaths } from "../domain/services";

/**
 * api route 定义，之所以需要这个文件
 * 是希望有一个统一的地方可以清晰的看到所有的路由配置
 * 方便开发人员快速的查找定位问题
 */
export function routers(r: NarrowDomainPaths<DomainPaths>) {
  /** 首页默认路由 */
  r.get("/", "home.index");
  r.post("/", "home.index");
  r.put("/", "home.index");
  r.del("/", "home.index");

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
  r.get("/users/mobiles/:mobile/info", "user.info");

  /** 敏感操作申请 */
  r.post("/demands/users", "demand.user");
  r.post("/demands/sessions", "demand.session");
  r.post("/demands/passwords", "demand.password");
  r.post("/demands/mobiles", "demand.mobile");

  /** 文件相关 */
  r.collection("file", undefined, "user");
  /** 大文件上传, 分片 */
  r.put("/users/:userId/files/slices", "user.addFileSlice");
  /** 大文件上传结尾 */
  r.post("/users/:userId/files/slices", "user.mergeFileSlice", 201);

  /** 消息提醒 notice 相关 */
  r.collection("notice", undefined, "user");
  r.put("/notices/:id/status/:value", "notice.changeStatus");
  r.del("/notices/:id", "notice.remove");
  r.put("/users/:userId/notices/status/read", "user.setNoticesRead");
}
