import type { Server } from "bun";
import fs from "fs"
import { ImgServer } from "./ws";
import type { ImgMessage } from "../shared/controllers";
// import faceapi from "./face"

export type Handle = (req: Request, server: Server) => ((void | Response) | Promise<void | Response>);

export class HttpBus {
  handles: HttpController[] = [];

  add(handle: HttpController) {
    this.handles.push(handle);
  }

  match(req: Request): Handle | void {
    let h: Handle | void;
    for (const handle of this.handles) {
      if (h = handle.match(req.URL.pathname, req)) {
        return h;
      }
    }
  }
}

export abstract class HttpController {
  constructor(bus: HttpBus) {
    bus.add(this);
  }

  abstract match(path: string, req: Request): Handle | void;
}

export class WsUpgrade extends HttpController {
  match(path: string): Handle | void {
    if (path == "/ws") {
      return this.upgrade.bind(this);
    }
  }

  upgrade(req: Request, server: import("bun").Server) {
    const topics = req.URL.searchParams.entries()
      .filter(([key]) => key == "t")
      .map(([_,val]) => val)
      .toArray();

    const isMc = req.URL.searchParams.get("mc");

    const ok = server.upgrade(req, {
      data: {
        topics,
        isMc,
        bus: server.bus,
      }
    });

    return ok ? void 0 : Response.error()
  }
}

export class FaceApi extends HttpController {
  constructor(bus: HttpBus) {
    super(bus);
    fs.mkdirSync("public/.tmp",{ recursive: true });
    fs.mkdirSync("public/.vec",{ recursive: true });
  }

  match(path: string, req: Request): Handle | void {
    if (req.method == "POST" && path == "/pict") {
      return this.pictAttempt.bind(this);
    }
    if (req.method == "POST" && path == "/pict/attempt") {
      return this.pictAttempt.bind(this);
    }
    if (req.method == "POST" && path == "/pict/register") {
      return this.register.bind(this);
    }
    if (req.method == "POST" && path == "/pict/rm") {
      return this.remove.bind(this);
    }
    if (req.method == "GET" && path == "/pict/registered") {
      return this.listRegistered.bind(this);
    }
  }

  async pictAttempt(req: Request, server: Server) {
    const img = await req.arrayBuffer();
    // await Bun.write("public/.tmp/current.jpg", img);
    server.publish("imgbin", img);
    return new Response();
  }

  async listRegistered(req: Request) {
    if (req.headers.get("accept") == "application/json") {
      const ls = fs.readdirSync("public/.vec")
      const vecs = ls.map(e => {
        return {
          name: e,
          value: JSON.parse(fs.readFileSync("public/.vec/" + e,"utf8"))
        }
      });
      return Response.json({ desc: vecs },{
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const ls = fs.readdirSync("public/.tmp")
    return Response.json({ images: ls },{
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  async remove(req: Request) {
    const id = req.URL.searchParams.get("id");
    if (!id) return new Response()
    try {
      fs.rmSync(`public${id}`)
      fs.rmSync(`public${id.replace(".tmp",".vec")}`)
      console.log(`public${id.replace(".tmp",".vec")}`)
    } catch (err) { }
    return new Response()
  }

  async register(req: Request, server: Server) {
    try {
      const form = await req.formData();

      const vec = JSON.parse(form.get("desc") as string);
      const buf = form.get("img") as Blob;

      const id = Date.now();
      await Bun.write("./public/.vec/"+id+".json",JSON.stringify(vec));
      await Bun.write("./public/.tmp/"+id+".png",buf);

      server.bus.publish({ id: "img", value: { kind: "register" } satisfies ImgMessage });
      return new Response(void 0,{ headers: { "Access-Control-Allow-Origin": "*" } })
    } catch (err) {
      console.error(err)
      return Response.json("Internal Error", { status: 500 })
    }
  }

}

export default [WsUpgrade, FaceApi] as ((new (bus: HttpBus) => HttpController))[]
