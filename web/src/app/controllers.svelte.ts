import type { DoorMessage, DoorState, ImgMessage, McuMessage, McuState } from "../shared/controllers"
import type { EventBus2 } from "../shared"
import { FaceApi } from "./face";

export abstract class Controller<T, M> {
  constructor(protected bus: EventBus2) {
    bus.on(this.getId(), message => {
      if ("kind" in message && message.kind == "sync") {
        this.setState(message.value);
      } else {
        this.onMessage(message);
      }
    })
  }

  abstract getId(): string;
  abstract getState(): T;
  abstract setState(state: T): void;

  onMessage(_: M): void { }

  publish(message: M): void {
    this.bus.publish({
      id: this.getId(),
      value: message,
    });
  }
}

export class DoorClient extends Controller<DoorState, DoorMessage> {
  static ID = "door"
  state: DoorState = $state.raw({ open: false })

  getId() { return DoorClient.ID; }
  getState() { return this.state; }
  setState(state: DoorState) { this.state = state; }

  toggle() {
    this.publish({ kind: "toggle" })
  }
}

export class McuClient extends Controller<McuState, McuMessage> {
  static ID = "mcu"
  state: McuState = $state.raw({
    flash: false,
  })

  getId() { return McuClient.ID; }
  getState(): McuState { return this.state; }
  setState(state: McuState) { this.state = state; }

  flashtoggle() {
    this.publish({ kind: "flash:toggle" })
  }
}

export class ImgClient extends Controller<{}, ImgMessage> {
  static ID = "img"

  state: string = $state("menunggu percobban masuk...");
  blob: Blob | null = $state(null);
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;

  registerPromise: Promise<void>;
  registered: { name: string, value: any }[];

  getId() { return ImgClient.ID; }
  getState() { return {} }
  setState(_: {}) { }

  constructor(bus: EventBus2, private faceapi: FaceApi) {
    super(bus);
    this.canvas = document.createElement("canvas");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.img = new Image(800,600);
    this.img.alt = "Percobaan masuk akan tampil disini"
    this.faceapi.on("canvas", () => this.state = "menampilkan hasil...")
    this.faceapi.on("face", () => this.state = "menampilkan deteksi wajah...")
    this.faceapi.on("finish", () => this.state = "")
    this.registerPromise = this.fetchRegister();
  }

  async fetchRegister() {
    const res = await fetch(import.meta.env.VITE_SERVER_URL + "/pict/registered",{
      headers: { accept: "application/json" }
    });
    const data: { desc: { name: string, value: any }[] } = await res.json();
    this.registered = data.desc;
  }

  async onMessage(message: ImgMessage) {
    if (message.kind == "client:binary") {
      this.blob = message.blob;
      this.state = "Memproses gambar...";
      this.img.src = URL.createObjectURL(message.blob);

      try {
        const res = await this.faceapi.find(this.img, this.registered.map(e => e.value));
        if (res.index == -1) {
          this.state = "wajah tidak dikenali"
        } else {
          if (res.similarity > 0.5) {
            this.state = "berhasil"
            this.bus.publish({
              id: "door",
              value: { kind: "open" } satisfies DoorMessage
            })
          } else {
            this.state = "wajah tidak dikenali"
          }
        }

        // this.state = JSON.stringify(res)

      } catch (err: any) {
        this.state = err?.message ?? (""+err)
      }
    }

    else if (message.kind == "attempt") {
      this.state = "Percobban masuk !";
    }

    else if (message.kind == "register") {
      this.registerPromise = this.fetchRegister();
    }
  }

  async remove(id: string) {
    await fetch(import.meta.env.VITE_SERVER_URL + "/pict/rm?id=" + id,{
      method: "POST",
      body: ""
    })
  }

  debug() {
    this.bus.publish({ id: "img", value: { kind: "debug:binary" }  });
  }

  static image(node: HTMLElement, self: ImgClient) {
    node.append(self.img);
    // node.append(self.canvas);
  }
}

export class RegisterClient {
  private pict = new PictDebug(this.oncapture.bind(this));

  state = $state("");
  modal = $state(false);
  promise = $derived(this.pict.promise);
  vidElem: HTMLVideoElement | undefined = void 0;

  constructor(private faceapi: FaceApi) { }

  capture() { this.pict.capture() }

  async oncapture(url: string) {
    if (!this.vidElem) {
      return;
    }

    this.state = "memproses...";
    const result = await this.faceapi.process(this.vidElem);

    if (result.face.length == 0) {
      this.state = "tidak ada wajah terdeteksi";
      return;
    }

    const e = await fetch(url)
    const face = result.face[0].embedding;

    const form = new FormData()
    form.set("img", await e.blob());
    form.set("desc", JSON.stringify(face));

    const _ = fetch(import.meta.env.VITE_SERVER_URL + "/pict/register",{
      method: "POST",
      body: form,
    });

    this.modal = false;
  }

  static use(node: HTMLVideoElement, self: RegisterClient) {
    self.vidElem = node;
    const des = PictDebug.use(node, self.pict);
    return {
      destroy() {
        des.destroy();
        self.vidElem = void 0
      }
    }
  }
}

export class PictDebug {
  promise = $state(new Promise(() => {}));

  constructor(
    private oncapture: (dataUrl: string) => any
  ) {}

  private static data: {
    stream: MediaStream,
    track: MediaStreamTrack,
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
  } | null = null;

  capture() {
    const self = PictDebug;
    if (!self.data) return console.warn("[PICT_DEBUG] No stream available");

    const vid = self.data.video;
    const cv = self.data.canvas;
    cv.width = vid.width;
    cv.height = vid.height;

    const context = self.data.canvas.getContext("2d");
    if (!context) return console.warn("[PICT_DEBUG] No canvas 2d context");
    context.drawImage(vid, 0, 0, vid.width, vid.height);

    const dataUrl = cv.toDataURL('image/jpeg');

    this.oncapture(dataUrl);

    // document.querySelector("img")!.src = dataUrl;
  }

  static use(node: HTMLVideoElement, self: PictDebug) {
    self.promise = navigator.mediaDevices.getUserMedia({
      video: { width: 800, height: 600 },
    })
    .then(stream => {
      const track = stream.getVideoTracks().at(0);

      if (!track) {
        self.promise = Promise.reject(new Error("no track available"));
        return console.warn("[PICT_DEBUG] no track available")
      }

      const settings = track.getSettings();
      const canvas = document.createElement("canvas");

      node.width = settings.width ?? node.width;
      node.height = settings.height ?? node.height;
      canvas.width = settings.width ?? canvas.width;
      canvas.height = settings.height ?? canvas.height;

      PictDebug.data = { stream, track, canvas, video: node, };
      node.srcObject = stream;
      node.onloadedmetadata = node.play.bind(node);
    });

    return {
      destroy() {
        PictDebug.data?.track.stop()
      }
    }
  }

}

