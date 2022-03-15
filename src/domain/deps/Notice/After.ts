import type { TDeps } from "../../deps";
import { Profile } from "../../services/_schemas/profile-has-token";
import { Session } from "../Auth";
import type { Main } from ".";

type Deps = Pick<TDeps, "async" | "cia" | "parallel" | "User">;
type TModel = ReturnType<typeof Main>;

export function After(...args: any[]) {
  const Model = args[0] as TModel;
  const deps = args[2] as Deps;

  const { async, cia, User } = deps;
  // 监听事件，自动生成 notice
}
