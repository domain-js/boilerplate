import { Profile } from "../_schemas/profile";
import { Params } from "./schemas/index";

export function Main() {
  const startAt = new Date();
  const index = (profile: Profile, params: Params) => ({
    name: "I am open-domain layer",
    startAt,
    now: new Date(),
    profile,
    params,
  });

  return { index };
}
