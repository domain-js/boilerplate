import { Http } from "@domain.js/main";

import { cnf } from "../configs";
import { domain } from "../domain";
import { httpCodes } from "./http-codes";
import { routers } from "./routers";

const Start = Http(cnf.http, { domain, httpCodes, routers });
Start();
