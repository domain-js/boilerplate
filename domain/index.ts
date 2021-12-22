import { cnf } from "./configs";
import { deps } from "./deps";
import { Services } from "./services";

export { getSchemaByPath } from "./services";

export const domain = Services(cnf, deps);
