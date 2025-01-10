import type { ImgMessage } from "../shared/controllers";
import type { Server } from "bun";
import type { WsData } from "./ws";
import fs from "fs"
import path from "path"

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
  match(path: string) {
    if (path == "/ws") {
      return this.upgrade.bind(this);
    }
  }

  upgrade(req: Request, server: Server) {
    const topics = req.URL.searchParams.entries()
      .filter(([key]) => key == "t")
      .map(([_,val]) => val)
      .toArray();

    const isMc = Boolean(req.URL.searchParams.get("mc"));

    const ok = server.upgrade<WsData>(req, {
      data: {
        topics,
        isMc,
        server,
        bus: server.bus,
      }
    });

    return ok ? void 0 : Response.error()
  }
}

export class FaceApi extends HttpController {
  private static IMG_PATH_PREFIX = Bun.env["IMG_PATH_PREFIX"] || "public"
  private static VEC_PATH_PREFIX = Bun.env["VEC_PATH_PREFIX"] || "public"

  private static IMG_PATH = path.join(FaceApi.IMG_PATH_PREFIX,"./.tmp");
  private static VEC_PATH = path.join(FaceApi.VEC_PATH_PREFIX,"./.vec");

  constructor(bus: HttpBus) {
    super(bus);
    fs.mkdirSync(FaceApi.IMG_PATH, { recursive: true });
    fs.mkdirSync(FaceApi.VEC_PATH, { recursive: true });
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
    server.publish("imgbin", img);
    return new Response();
  }

  async listRegistered(req: Request) {
    if (req.headers.get("accept") == "application/json") {
      const vecs = fs.readdirSync(FaceApi.VEC_PATH)
        .map(name => ({
          name,
          value: JSON.parse(fs.readFileSync(FaceApi.VEC_PATH + "/" + name, "utf8"))
        }));
      return Response.json({ desc: vecs },{
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const ls = fs.readdirSync(FaceApi.IMG_PATH)
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
      fs.rmSync(FaceApi.IMG_PATH_PREFIX + id)
      fs.rmSync(FaceApi.VEC_PATH_PREFIX + id.replace(".tmp",".vec"))
    } catch (err) {
      console.error("[FACE_API] failed to remove",id,":",err)
    }
    return new Response()
  }

  async register(req: Request, server: Server) {
    try {
      const form = await req.formData();

      const vec = JSON.parse(form.get("desc") as string);
      const buf = form.get("img") as Blob;

      const id = Date.now();
      await Bun.write(FaceApi.IMG_PATH + "/" + id + ".png", buf);
      await Bun.write(FaceApi.VEC_PATH + "/" + id + ".json", JSON.stringify(vec));

      server.bus.publish({ id: "img", value: { kind: "register" } satisfies ImgMessage });
      return new Response(void 0,{ headers: { "Access-Control-Allow-Origin": "*" } })
    } catch (err) {
      console.error("[FACE_API] failed to register:", err)
      return Response.error()
    }
  }

}

export default [WsUpgrade, FaceApi] as ((new (bus: HttpBus) => HttpController))[]
