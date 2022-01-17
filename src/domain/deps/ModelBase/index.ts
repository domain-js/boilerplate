import { ReadonlyArray2union } from "@domain.js/main/dist/types";
import { TDeps } from "../../deps";

export const Deps = ["async", "Sequelize"] as const;
type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

type Unpack<K extends Promise<any>> = K extends Promise<infer R> ? R : K;

export function Main(cnf: any, deps: Deps) {
  const { Sequelize } = deps;

  return class ModelBase<Attrs, Attrs4Create> extends Sequelize.Model<Attrs, Attrs4Create> {
    static getByPk(pk: string | number) {
      return this.findByPk(pk);
    }

    static async getByPks(pks: string[] | number[]) {
      if (!Array.isArray(pks) || !pks.length) return [];
      const list: Unpack<ReturnType<typeof this.getByPk>>[] = [];
      for await (const x of pks) {
        const item = await this.getByPk(x);
        if (item) list.push(item);
      }

      return list;
    }
  };
}
