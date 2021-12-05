import { TModel } from "@domain.js/main/dist/deps/rest/defines";
import { ErrorFn } from "@domain.js/main/dist/Errors";
import { Model } from "sequelize/types";
import { deps } from "../../deps";

type Deps = Pick<typeof deps, "errors">;

export function Main(cnf: any, deps: Deps) {
  const { errors } = deps;

  return async (
    Model: TModel,
    id: string | number,
    opt: Parameters<typeof Model.findByPk>[1],
    error: ErrorFn,
  ) => {
    let one;
    if (opt) {
      one = await (Model as any).findByPk(id, opt);
    } else {
      one = await (Model as any).getByPk(id);
    }
    if (!one || one.isDeleted === "yes") throw error || errors.notFound(`${Model.name}: ${id}`);

    return one as Model;
  };
}

export const Deps = ["errors"];
