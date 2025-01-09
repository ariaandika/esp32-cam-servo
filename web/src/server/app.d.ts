
declare module "bun" {
  interface Server {
    router: import("./http").HttpBus
    bus: import(".").Bus
  }
}

interface Request {
  URL: URL
}

interface Console {
  debug(...any: any[]): void;
}

