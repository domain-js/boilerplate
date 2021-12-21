import { Cnf } from "../../configs";
import { deps } from "../../deps";

type Deps = Pick<typeof deps, "Auth">;

function Helper(cnf: Cnf, deps: Deps) {
  const { Auth } = deps;

  return async ({ token }) => {
    if (token) return Auth.readUserByToken(token);

    return null;
  };
}

Helper.Deps = ["Auth"];

module.exports = Helper;
