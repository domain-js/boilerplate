import type { Profile as _Profile } from "./profile";
import { profile as _profile } from "./profile";

export type Profile =
  | (_Profile & Required<Pick<_Profile, "token">>)
  | (_Profile & Required<Pick<_Profile, "sign">>);

export const profile = {
  ..._profile,
  required: undefined,
  oneOf: [
    { required: ["clientIp", "remoteIp", "realIp", "token"] },
    { required: ["clientIp", "remoteIp", "realIp", "sign"] },
  ],
};
