import { Http } from "@domain.js/main";
import { domain, getSchemaByPath } from "../domain";
import { httpCodes } from "./http-codes";
import { routers } from "./routers";
import { cnf } from "../configs";

const Start = Http(cnf.http, { domain, getSchemaByPath, httpCodes, routers });
Start();
