import type { ServerWebSocket } from "bun";
import { networkInterfaces } from "os"

export type WsUpgrade = { addr: string, topics: Set<string> };

export type ClientMessage =
  | {
    kind: "door:toggle"
  }
  | {
    kind: "device:geo:send"
    value: GeoData
  }
  | {
    kind: "mc:geo:send"
    value: GeoData
  }

export type ServerMessage =
  | {
    kind: "state"
    value: State
  }

export type GeoData = {
  lat: number,
  lon: number
}

export type State = {
  door: boolean
  mcGeo: GeoData | null
  deviceGeo: GeoData | null
}

const stateTopic = "topic:state";

let state: State = {
  door: false,
  mcGeo: null,
  deviceGeo: null
}

const server = Bun.serve({
  hostname: get_ip(),

  async fetch(request, server) {
    const url = new URL(request.url);
    console.log(url.pathname)

    if (request.method.toUpperCase() == "GET" && url.pathname == "/admin") {
      const ok = server.upgrade<WsUpgrade>(request,{
        data: {
          addr: server.requestIP(request)?.address ?? "",
          topics: new Set()
        }
      });
      return ok ? void 0 : Response.json("WebSocket Failed", { status: 400 });
    }

    if (request.method.toUpperCase() == "POST" && url.pathname == "/pict") {
      try {
        const data = await request.blob();
        await Bun.write("./app.png",data);
        return new Response();
      } catch (err) {
        console.error(err)
        return Response.json("deez",{ status: 400 })
      }
    }

    return Response.json("Not Found", { status: 404 })
  },

  websocket: {
    idleTimeout: 60 * 10,
    open(ws: ServerWebSocket<WsUpgrade>) {
      try {
        console.log("client open",ws.data.addr)

        ws.send(JSON.stringify({
          kind: "state",
          value: state
        } satisfies ServerMessage));

        ws.subscribe(stateTopic);

      } catch (err) {
        console.error(err)
      }
    },

    message(ws, message) {
      try {
        const input: ClientMessage = JSON.parse(message.toString());

        if (input.kind == "device:geo:send") {
          state.deviceGeo = input.value;
          publishState();
        }

        else if (input.kind == "mc:geo:send") {
          state.mcGeo = input.value;
          publishState();
        }

        else if (input.kind == "door:toggle") {
          state.door = !state.door;
          publishState();
        }

      } catch (err) {
        console.error(err)
      }
    },
    close(ws, code, reason) {
      console.log("client close,",ws.data.addr,code,reason)
      ws.unsubscribe(stateTopic)
    },
  }
})

console.log(`Listening in http://${server.hostname}:${server.port}`);

function publishState() {
  server.publish(stateTopic, JSON.stringify({
    kind: "state",
    value: state,
  } satisfies ServerMessage))
}

function get_ip() {
  return Object.entries(networkInterfaces())
    .filter(([name,val]) => name !== "lo" && val)
    .map((e) => e[1]?.filter(e => e.family == "IPv4").at(0))
    .map(e => e?.address).at(0)
}

