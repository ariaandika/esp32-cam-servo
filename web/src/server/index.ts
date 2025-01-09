import type { Server, WebSocketServeOptions } from "bun";
import { EventBus2, type Message } from "../shared";
import routes, { HttpBus } from "./http"
import os from "os"
import wsctr, { type WsData } from "./ws"

export class Bus extends EventBus2 {
  server: Server;

  get url() {
    return this.server.url;
  }

  constructor(app: WebSocketServeOptions<WsData>) {
    super();
    this.server = Bun.serve(app);
    this.server.router = new HttpBus();
    this.server.bus = this;
  }

  publish(data: Message): void {
    this.server.publish(data.id, JSON.stringify(data));
  }
}

const app = {
  hostname: Bun.env["HOST"] || getIp(),

  async fetch(req, server) {
    if (req.method == "OPTIONS") {
      return new Response("", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        }
      })
    }

    req.URL = new URL(req.url);
    if (req.URL.pathname.startsWith("/api")) {
      req.URL.pathname = req.URL.pathname.slice("/api".length);
    }
    console.log("[APP]",req.URL.pathname)

    const handle = server.router.match(req)

    return await handle?.(req, server) ?? Response.json("Not Found", { status: 404 });
  },

  websocket: {
    idleTimeout: 60 * 10,

    open(ws) {
      console.write("[WEBSOCKET] open " + ws.remoteAddress + " [ ");
      ws.data.topics.forEach(e => console.write(e + ", "));
      console.log("]");

      ws.data.topics.forEach(ws.subscribe.bind(ws));
      ws.data.topics.forEach(
        id => ws.data.bus.event.dispatchEvent(
          new CustomEvent("publish:"+id,{ detail: ws })
        )
      );
    },

    message(ws, message) {
      try {
        const data: Message = JSON.parse(message.toString());
        console.debug("[WEBSOCKET]",data)
        ws.data.bus.dispatch(data);
      } catch (err) {
        console.error("[WEBSOCKET] Error:",err)
      }
    },

    close(ws, _, reason) {
      console.log("[WEBSOCKET] close",ws.remoteAddress,reason)
      ws.data.topics.forEach(ws.unsubscribe.bind(ws));
    }
  }
} satisfies WebSocketServeOptions<WsData>;

(() => {
  console.debug = function(...any) {
    // console.log(...any)
  }
  const bus = new Bus(app);
  routes.forEach(e => new e(bus.server.router));
  wsctr.forEach(e => new e(bus));
  console.log("[APP] Listening in", bus.url.toJSON());
})();

function getIp() {
  return Object.entries(os.networkInterfaces())
    .filter(([name,val]) => name !== "lo" && val)
    .map((e) => e[1]?.filter(e => e.family == "IPv4").at(0))
    .map(e => e?.address).at(0)
}

