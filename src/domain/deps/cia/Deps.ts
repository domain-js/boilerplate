import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";

import type { TDeps } from "../../deps";

export const Deps = ["_", "logger", "graceful", "consts", "schema", "myCia"] as const;

export type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;
