import { Http } from "@domain.js/main";
import { domain, getSchemaByPath } from "../domain";
import { httpCodes } from "./http-codes";
import { routers } from "./routers";

const Start = Http({}, { domain, getSchemaByPath, httpCodes, routers });
Start();
