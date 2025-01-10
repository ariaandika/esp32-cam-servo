import { EventBus, type Message } from "../shared";

export class WsController extends EventBus {
  promise: Promise<unknown> = $state(new Promise(()=>{}));

  private ws: WebSocket;
  private reconnectDelay = 1000;

  constructor(...topics: string[]) {
    super();
    this.connect(topics);
  }

  publish(data: Message) {
    this.ws?.send(JSON.stringify(data));
  }

  connect(topics: string[]) {
    const t = new URLSearchParams(topics.map(e => ["t",e]));
    const q = (t.size == 0 ? "" : "?") + t.toString();
    this.ws = new WebSocket(import.meta.env.VITE_SERVER_URL + "/ws" + q);

    this.ws.addEventListener("open", () => {
      this.promise = Promise.resolve();
    })

    this.ws.addEventListener("message", e => {
      if (typeof e.data == "string") {
        const data: Message = JSON.parse(e.data);
        this.dispatch(data)
      } else if (e.data instanceof Blob) {
        this.dispatch({ id: "img", value: { kind: "client:binary", blob: e.data } })
      } else {
        console.log("[WEBSOCKET] binary data");
        console.log(e.data);
      }
    })

    this.ws.addEventListener("close", e => {
      this.promise = Promise.reject(new Error(e.code + " " + e.reason))
      setTimeout(() => this.connect(topics), this.reconnectDelay);
    })
  }

  destroy() {
    this.ws?.close()
  }
}

export class GeoController {
//   promise: Promise<unknown> = $state(new Promise(()=>{}));
//   loc: GeolocationPosition | null = null;
//
//   private id: number = 0;
//   private ws: WsController
//   private resolve: (() => void) | null = null;
//
//   display = $derived.by(() => {
//     if (!this.loc) {
//       return ""
//     }
//     const coords = this.loc.coords;
//     return `Latitude ${coords.latitude}, Longitude ${coords.longitude}`
//   });
//
//   constructor(ws: WsController) {
//     this.ws = ws;
//     this.connect();
//   }
//
//   connect() {
//     const reject = (err: GeolocationPositionError) => this.promise = Promise.reject(err);
//     const opt: PositionOptions = {
//       enableHighAccuracy: true,
//     };
//
//     this.resolve = () => {
//       this.promise = Promise.resolve();
//       this.resolve = null;
//     }
//     this.id = navigator.geolocation.watchPosition(this.onPosition.bind(this), reject, opt);
//   }
//
//   onPosition(geo: GeolocationPosition) {
//     console.log("Position",geo.coords)
//     this.loc = geo;
//
//     this.ws.send({
//       kind: "device:geo:send",
//       value: { lat: geo.coords.latitude, lon: geo.coords.longitude },
//     });
//
//     this.resolve?.();
//   }
//
//   destroy() {
//     if (this.id) {
//       navigator.geolocation.clearWatch(this.id)
//     }
//   }
}

