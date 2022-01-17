import { profile as _profile } from "./profile";
import type { Profile as _Profile } from "./profile";

export type Profile = Required<_Profile>;

export const profile = { ..._profile, required: ["clientIp", "remoteIp", "realIp", "token"] };
