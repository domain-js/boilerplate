import { cnf } from "../configs";
import { deps } from "./deps";
import { Services } from "./services";

export const domain = Services(cnf, deps);

const { errors, logger } = deps;
process.on("uncaughtException", (e) => {
  const error = errors.processUncaughtException(e);
  console.error(error);
  logger.error(error);
});
process.on("unhandledRejection", (reason, p) => {
  const error = errors.processUnhandledRejection(reason, p);
  console.error(error);
  logger.error(error);
});
process.on("rejectionHandled", (e) => {
  const error = errors.processRejectionHandled(e);
  console.error(error);
  logger.error(error);
});
