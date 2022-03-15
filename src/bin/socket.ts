import path from "path";
import io from "socket.io-client";
import * as uuid from "uuid";

(async (root, token, names, Authorization) => {
  if (!root) throw Error("需要设定api根地址，第一个参数");
  if (!token) throw Error("需要设定token, 第二个参数");
  if (!names) throw Error("需要设定要监听的事件名称, 多个用逗号(,)隔开, 第三个参数");

  const url = new URL(root);

  const address = `${url.protocol.replace(/^http/, "ws")}//${url.host}`;
  const socket = io(address, {
    path: path.join(`${url.pathname}/`, "socket.io"),
    transports: ["websocket"],
    extraHeaders: {
      Authorization,
    },
  });

  let ready = false;
  let entranced = false;
  let session = null;

  const init = () => {
    console.log("initing");
    ready = false;
    entranced = false;
    socket.emit("init", "user", token, { revision: "0.0.1", uuid: uuid.v4() });
  };

  socket.on("connect", init);
  socket.on("internalError", console.error.bind(console, "Server internalError"));
  socket.on("connect_error", console.error.bind(console, "Connect error: %o"));
  socket.on("connect_timeout", console.error.bind(console, "Connect timeout: %o"));
  socket.on("disconnect", console.error.bind(console, "Disconnect: reason: %o"));
  socket.on("reconnect", init);
  socket.on("initError", console.error.bind(console, "Init error: %o"));
  socket.on("inited", (data) => {
    ready = true;
    session = data;
    entranced = false;
    console.log("inited", data);
  });
  socket.on("entraced", (data) => {
    entranced = true;
  });
  for (const name of names.split(",")) {
    socket.on(name, console.log.bind(console, "Receive mssage name: %s, msg: %o", name));
  }
})(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
