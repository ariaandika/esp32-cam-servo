import type { ClientMessage, ServerMessage, State } from "../server"

export class WsController {
  promise: Promise<unknown> = $state(new Promise(()=>{}));
  state: State = $state({} as any);

  // private static HOST = "http://localhost:3000" as const;
  private host = "http://192.168.10.82:3000" as const;
  private ws: WebSocket = {} as any;
  private path: string
  private reconnectDelay = 4000;

  get URL() {
    return this.host + this.path;
  }

  constructor(path = "") {
    this.path = path;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.URL);

    this.ws.addEventListener("open", () => {
      this.promise = Promise.resolve();
    })

    this.ws.addEventListener("message", e => {
      const message: ServerMessage = JSON.parse(e.data.toString());

      if (message.kind == "state") {
        this.state = message.value;
      }
    })

    this.ws.addEventListener("close", e => {
      this.promise = Promise.reject(new Error(e.reason))
      setTimeout(this.connect.bind(this), this.reconnectDelay);
    })
  }

  send(data: ClientMessage) {
    this.ws.send(JSON.stringify(data));
  }

  destroy() {
    this.ws?.close()
  }
}

export class GeoController {
  promise: Promise<unknown> = $state(new Promise(()=>{}));
  loc: GeolocationPosition | null = null;

  private id: number = 0;
  private ws: WsController
  private resolve: (() => void) | null = null;

  display = $derived.by(() => {
    if (!this.loc) {
      return ""
    }
    const coords = this.loc.coords;
    return `Latitude ${coords.latitude}, Longitude ${coords.longitude}`
  });

  constructor(ws: WsController) {
    this.ws = ws;
    this.connect();
  }

  connect() {
    const reject = (err: GeolocationPositionError) => this.promise = Promise.reject(err);
    const opt: PositionOptions = {
      enableHighAccuracy: true,
    };

    this.resolve = () => {
      this.promise = Promise.resolve();
      this.resolve = null;
    }
    this.id = navigator.geolocation.watchPosition(this.onPosition.bind(this), reject, opt);
  }

  onPosition(geo: GeolocationPosition) {
    console.log("Position",geo.coords)
    this.loc = geo;

    this.ws.send({
      kind: "device:geo:send",
      value: { lat: geo.coords.latitude, lon: geo.coords.longitude },
    });

    this.resolve?.();
  }

  destroy() {
    if (this.id) {
      navigator.geolocation.clearWatch(this.id)
    }
  }
}
