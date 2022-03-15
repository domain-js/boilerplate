import type { Client } from "@domain.js/main/dist/http/socket";
import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";

import type { TDeps } from "../../deps";

export const Deps = ["errors", "hSession", "getOrThrown"] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export function Main(cnf: any, deps: TDeps) {
  const { _, errors, logger, cia, IORedis } = deps;

  /** 房间相关操作对象 */
  const Rooms = (() => {
    const clients: Map<number | string, Set<Client>> = new Map();

    const entrance = (id: number | string, client: Client) => {
      // 不能同时在两个房间，从上一个房间退出
      if (client.roomId && client.roomId !== id) {
        quit(id, client);
      }
      const set = clients.get(id) || new Set();
      if (!set.size) {
        clients.set(id, set);
        // 发送房间开启通知
        cia.submit("online", id);
      }
      set.add(client);
    };

    const quit = (id: number | string, client: Client) => {
      const set = clients.get(id);
      if (!set) return;
      set.delete(client);
      if (!set.size) {
        clients.delete(id);
        // 发送房间开启通知
        cia.submit("offline", id);
      }
    };

    const send = (id: number | string, type: string, info: any) => {
      const set = clients.get(id);
      if (!set) return;
      for (const client of set) {
        client.emit(type, info);
      }
    };

    const sendOne = (id: number | string, type: string, info: any) => {
      const set = clients.get(id);
      if (!set) return;
      const client = [...set][_.random(set.size - 1)];
      client.emit(type, info);
    };

    return { entrance, quit, send, sendOne };
  })();

  /** 存放已连接的用户的监听函数 */
  const Clients = (() => {
    const clients: Map<number | string, Set<Client>> = new Map();

    const online = (id: number | string, client: Client) => {
      const set = clients.get(id) || new Set();
      if (!set.size) {
        // 第一次新创建的 set 要加入到 listener map 中去
        clients.set(id, set);
        // 发送用户上线通知
        cia.submit("online", id);
      }
      set.add(client);
    };

    const offline = (id: number | string, client: Client) => {
      const set = clients.get(id);
      if (!set) return;
      set.delete(client);

      // 集合为空，则说明该用户所有的客户端均离线，此时要发布下线广播
      if (!set.size) {
        clients.delete(id);
        cia.submit("offline", id);
      }

      // 下线的时候自动从所在房间退出
      if (client.roomId) Rooms.quit(client.roomId, client);
    };

    /**
     * 推送给单独某个人
     * @param id 推送给用户的 ID
     * @param type 消息类型
     * @param info 推送的信息
     */
    const send = (id: number | string, type: string, info: any) => {
      const set = clients.get(id);
      if (!set) return;
      for (const client of set) {
        client.emit(type, info);
      }
    };

    return { online, offline, send };
  })();

  /** 推送消息函数 */
  const sends = {
    single: Clients.send,

    /**
     * 按照房间推送
     * @param to 推送给房间的 ID
     * @param type 消息类型
     * @param info 推送的信息
     */
    room(to: string, type: string, info: any) {
      Rooms.send(to, type, info);
    },
  };

  // 通过 redis 做消息监听和推送, 从而达到所有分布式服务都能准确的推送消息出去
  const pub = new IORedis(cnf.redis);
  const sub = new IORedis(cnf.redis);
  const {
    socket: { channels },
  } = cnf;
  // 监听 redis 广播推送来的消息
  sub.subscribe([...channels], (err, count) => {
    if (err) logger.error(err);
    logger.info(`Queue subscribe succeed, channel count: ${count}`);
  });

  // 收到从 redis 广播来的消息，基于 channel 和 to 找到对应的 listener 推送 tpye, info 下去
  sub.on("message", async (channel: keyof typeof sends, text: string) => {
    if (!sends[channel]) return;
    const [to, type, info] = JSON.parse(text) as [string, string, any];
    if (channel === "single") {
      sends.single(Number(to), type, info);
    } else if (channel === "room") {
      sends.room(to, type, info);
    }
  });

  // 处理收到的 socket 推送消息，先广播到 redis 这样才能在多服务节点的时候不遗漏
  cia.link("socket.push", "publish2redis", ([channel, to, type, info]: any) => {
    if (!channels.has(channel)) throw errors.notFound("channel", channel);
    pub.publish(channel, JSON.stringify([to, type, info]));
  });

  return { Rooms, Clients };
}
