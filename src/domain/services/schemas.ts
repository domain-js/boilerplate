// domain-cli 自动生成
import * as authSchemasAdd from "./auth/schemas/add";
import * as authSchemasDetail from "./auth/schemas/detail";
import * as authSchemasRemove from "./auth/schemas/remove";
import * as homeSchemasIndex from "./home/schemas/index";
import * as userSchemasAdd from "./user/schemas/add";
import * as userSchemasChangeRole from "./user/schemas/change-role";
import * as userSchemasChangeStatus from "./user/schemas/change-status";
import * as userSchemasDetail from "./user/schemas/detail";
import * as userSchemasList from "./user/schemas/list";
import * as userSchemasModify from "./user/schemas/modify";
import * as userSchemasNameExists from "./user/schemas/name-exists";
import * as userSchemasRemove from "./user/schemas/remove";

export = {
  "auth/schemas/add": authSchemasAdd,
  "auth/schemas/detail": authSchemasDetail,
  "auth/schemas/remove": authSchemasRemove,
  "home/schemas/index": homeSchemasIndex,
  "user/schemas/add": userSchemasAdd,
  "user/schemas/changeRole": userSchemasChangeRole,
  "user/schemas/changeStatus": userSchemasChangeStatus,
  "user/schemas/detail": userSchemasDetail,
  "user/schemas/list": userSchemasList,
  "user/schemas/modify": userSchemasModify,
  "user/schemas/nameExists": userSchemasNameExists,
  "user/schemas/remove": userSchemasRemove,
};
