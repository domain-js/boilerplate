import { basicErrors, Errors } from "@domain.js/main";

const defines = [
  ["processUncaughtException", "进程捕获到未try catch的异常 %o"],
  ["processUnhandledRejection", "进程捕获到未设置 catch 的 promise %o"],
  ["processRejectionHandled", "进程捕获到未设置 catch 的 promise %o"],
  ["notFound", "Resource not found"],
  ["loginNameOrPassword", "Login auth but name or password incorrect"],
  ["loginLockByIP", "Login was locked, please wait a few minutes"],
  ["googleAuthCodeError", "Google code auth faild"],
  ["notAllowed", "No access"],
  ["notAllowedTheIp", "No access by IP"],
  ["tokenError", "Auth token not found"],
  ["loginVerifyError", "User authentication faild"],
  ["tokenErrorUserNotExisits", "Token incorrect, matched user not found"],
  ["tokenErrorUserStatusDisabled", "Token incorrect, matched user be disabled"],
  ["tokenErrorUserBeenDeleted", "Token incorrect, matched user be deleted"],
  ["resourceDuplicateAdd", "Resource duplication"],
  ["noAuth", "Not authentication"],
  ["uselessRequest", "Useless request"],
  ["domainMethodCallArgsInvalid", "domain method Illegal parameter"],
  ["userNameDuplication", "The user name exist already"],
  ["userMobileDuplication", "The user mobile exist already"],
  ["schemesUnmatched", "Schema match faild"],
  ["newPasswordSameOriginPassword", "Cannt set the password that be equal last password"],
  ["taskURLMustBeString", "Task url must be a string and non-empty"],
  ["parseFileDataValidateFaild", "解析xml文件，验证数据格式错误"],
  ["demandVerifyCodeError", "验证码错误，请重新请求发送或重新核实后输入"],
  ["recordLogFaildLackRequiredInfo", "记录操作日志失败，缺少必要的参数"],
] as const;

export const errors = Object.freeze({ ...basicErrors, ...Errors(defines) });

export class MyError extends Error {
  public message: string;
  public code: string | number;
  constructor(msg: string, code: string | number) {
    super();
    this.message = msg;
    this.code = code;
  }
}
