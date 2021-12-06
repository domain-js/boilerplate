import { Http } from "@domain.js/main";
import { domain } from "../domain";
import { codes } from "./http-codes";
import { routers } from "./routers";

const Start = Http({}, { domain, codes, routers });
Start();
