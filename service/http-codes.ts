export const httpCodes = {
  notFound: 404,
  notAllowed: 403,
  tokenError: 403,
  tokenErrorUserNotExisits: 404,
  tokenErrorUserStatusDisabled: 403,
  tokenErrorUserBeenDeleted: 404,
  resourceDuplicateAdd: 409,
  lackProfileParams: 422,
  lackParamsParams: 422,
  noAuth: 401,
  schemesUnmatched: 422,
  domainMethodCallArgsInvalid: 422,
};
