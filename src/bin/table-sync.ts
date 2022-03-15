import { ReadonlyArray2union } from "@domain.js/main/dist/types";

import { deps } from "../domain/deps";

const {
  consts: { MODELS },
} = deps;

(async (names: ReadonlyArray2union<typeof MODELS>[]) => {
  let curNames = names;
  if (!curNames.length) curNames = MODELS.slice();
  console.log(curNames);
  const set = new Set(MODELS);
  for await (const x of curNames) {
    if (!set.has(x)) continue;
    if (deps[x] && typeof deps[x].sync === "function") await deps[x].sync();
  }
  process.exit(0);
})(process.argv.slice(2) as any);
