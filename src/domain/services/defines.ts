// domain-cli 自动生成
import * as authAdd from "./auth/add";
import * as authDetail from "./auth/detail";
import * as authRemove from "./auth/remove";
import * as demandMobile from "./demand/mobile";
import * as demandPassword from "./demand/password";
import * as demandSession from "./demand/session";
import * as demandUser from "./demand/user";
import * as homeIndex from "./home/index";
import * as messageEntrance from "./message/entrance";
import * as messageSubscribe from "./message/subscribe";
import * as messageUnsubscribe from "./message/unsubscribe";
import * as noticeChangeStatus from "./notice/changeStatus";
import * as noticeRemove from "./notice/remove";
import * as userAdd from "./user/add";
import * as userAddFile from "./user/addFile";
import * as userAddFileSlice from "./user/addFileSlice";
import * as userAddNotice from "./user/addNotice";
import * as userChangeRole from "./user/changeRole";
import * as userChangeStatus from "./user/changeStatus";
import * as userDetail from "./user/detail";
import * as userFiles from "./user/files";
import * as userInfo from "./user/info";
import * as userList from "./user/list";
import * as userMergeFileSlice from "./user/mergeFileSlice";
import * as userModify from "./user/modify";
import * as userNotices from "./user/notices";
import * as userRemove from "./user/remove";
import * as userSetNoticesRead from "./user/setNoticesRead";

export = {
  "auth.add": authAdd,
  "auth.detail": authDetail,
  "auth.remove": authRemove,
  "demand.mobile": demandMobile,
  "demand.password": demandPassword,
  "demand.session": demandSession,
  "demand.user": demandUser,
  "home.index": homeIndex,
  "message.entrance": messageEntrance,
  "message.subscribe": messageSubscribe,
  "message.unsubscribe": messageUnsubscribe,
  "notice.changeStatus": noticeChangeStatus,
  "notice.remove": noticeRemove,
  "user.add": userAdd,
  "user.addFile": userAddFile,
  "user.addFileSlice": userAddFileSlice,
  "user.addNotice": userAddNotice,
  "user.changeRole": userChangeRole,
  "user.changeStatus": userChangeStatus,
  "user.detail": userDetail,
  "user.files": userFiles,
  "user.info": userInfo,
  "user.list": userList,
  "user.mergeFileSlice": userMergeFileSlice,
  "user.modify": userModify,
  "user.notices": userNotices,
  "user.remove": userRemove,
  "user.setNoticesRead": userSetNoticesRead,
};
