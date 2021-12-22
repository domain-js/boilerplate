import { Errors, basicErrors } from "@domain.js/main";

const defines = [
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
  ["schemesUnmatched", "Schema match faild"],
] as const;

export const errors = Object.freeze({ ...basicErrors, ...Errors(defines) });