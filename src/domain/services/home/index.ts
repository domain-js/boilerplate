import { Profile } from "../_schemas/profile";
export { Profile, profile } from "../_schemas/profile";

export type Params = any;

export const params = {
  description: "测试请求",
  type: ["object", "null"],
};

export function Main() {
  const startAt = new Date();
  return (profile: Profile, params: Params) => ({
    name: "I am open-domain layer",
    startAt,
    now: new Date(),
    profile,
    params,
  });
}
