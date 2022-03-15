import { ErrorFn } from "@domain.js/main/dist/Errors";
import { ReadonlyArray2union } from "@domain.js/main/dist/types";

import { deps } from "../../deps";

export const Deps = ["Sequelize", "errors"] as const;

type Deps = Pick<typeof deps, ReadonlyArray2union<typeof Deps>>;

export function Main(cnf: any, deps: Deps) {
  const { errors } = deps;

  return async <T extends abstract new (...args: any) => any>(
    Model: T,
    id: string | number,
    opt?: any,
    error?: ErrorFn,
  ): Promise<InstanceType<T>> => {
    let one;
    if (opt) {
      one = await (Model as any).findByPk(id, opt);
    } else {
      one = await (Model as any).getByPk(id);
    }
    if (!one || (one as any).isDeleted === "yes")
      throw error || errors.notFound(`${Model.name}: ${id}`);

    return one;
  };
}
