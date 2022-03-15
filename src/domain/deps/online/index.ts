import { ReadonlyArray2union } from "@domain.js/main/dist/types";

import { Cnf } from "../../../configs";
import { TDeps } from "../../deps";

export { After } from "./After";

/** 在线的ID类型 */
type Id = string | number;

export const Deps = [
  "graceful",
  "parallel",
  "redis",
  "cia",
  "async",
  "logger",
  "_",
  "utils",
] as const;

export function Main(cnf: Cnf, deps: Pick<TDeps, ReadonlyArray2union<typeof Deps>>) {
  const {
    online: { REDIS_KEY, autoOfflineSeconds },
  } = cnf;
  const {
    _,
    async,
    redis,
    logger,
    utils: { sleep },
  } = deps;

  // 当前在线情况
  const onlines = new Set<Id>();

  const KEY = (id: Id) => `${REDIS_KEY}::${id}`;

  const delay = async () => {
    if (!onlines.size) return;
    await async.eachLimit([...onlines], 10, async (id) => {
      // 延长 300 秒
      await redis.expire(KEY(id), autoOfflineSeconds);
    });
  };

  // 自动延期
  async.forever(async () => {
    try {
      await sleep(Math.ceil((autoOfflineSeconds * 1000) / 3));
      await delay();
    } catch (e) {
      logger.error(e);
    }
  }, logger.error);

  /**
   * 某个key 自动加一
   * @param key 要自增长的 key
   */
  const incr = async (key: string) => {
    const trans = redis.multi();
    trans.incrby(key, 1).expire(key, autoOfflineSeconds);
    const [[, val]] = await trans.exec();

    return val;
  };

  /**
   * 某个 Id 上线了
   * @param id 上线的 Id
   */
  const online = async (id: Id) => {
    onlines.add(id);
    const key = KEY(id);
    const val = await incr(key);
    // 判断是否需要矫正，小于1 则强制置为1
    if (val < 1) await redis.set(key, 1, "EX", autoOfflineSeconds, "XX");

    // 返回是否是首次上线
    return val === 1;
  };

  /**
   * 某个 Id 下线了
   * @param id 下线的 Id
   */
  const offline = async (id: Id) => {
    onlines.delete(id);
    const key = KEY(id);
    const val = await redis.incrby(key, -1);
    // 判断是否需要矫正，小于1 则删除
    if (val < 1) await redis.del(key);

    // 返回是否是最后一个下线
    return val === 0;
  };

  /**
   * 获取多个在线情况
   * @param ids 要获取的 Id 列表
   */
  const multi = async (ids: Id[]) => {
    if (!Array.isArray(ids) || !ids.length) return {};
    const keys = ids.map((x) => KEY(x));
    const vals = await redis.mget(keys);

    return _.zipObject(ids, _.map(vals, Boolean));
  };

  /**
   * 获取某个 Id 是否在线
   * @param id
   */
  const has = async (id: Id) => {
    const key = KEY(id);
    const v = Number(await redis.get(key)) | 0;

    return v > 0;
  };

  /**
   * 获取当前进程在线数量
   */
  const size = () => onlines.size;

  /**
   * 进程退出时候执行的函数
   */
  const onExit = () => async.eachLimit([...onlines], 10, offline);

  /**
   * 扩充列表中的元素的在线状态
   * @param list
   */
  const expandList = async <Key extends string, T extends { [K in Key]: Id }>(
    list: T[],
    key: Key,
  ): Promise<(T & { online: boolean })[]> => {
    const record = await multi(list.map((x) => x[key]));

    return list.map((x) => Object.assign(x, { online: record[x[key]] }));
  };

  return { has, multi, size, expandList, online, offline, onExit };
}
