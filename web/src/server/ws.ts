import type { DoorMessage, DoorState, ImgMessage, McuMessage, McuState } from "../shared/controllers";
import type { EventBus } from "../shared";
import type { Server } from "bun";

export interface WsData {
  topics: string[]
  server: Server
  bus: EventBus
  isMc: boolean
}

export abstract class Controller<State,Message> {
  constructor(protected bus: EventBus) {
    bus.on("publish:"+this.getId(), ws => ws.send(JSON.stringify({
      id: this.getId(),
      value: {
        kind: "sync",
        value: this.getState()
      }
    } satisfies import("../shared").Message)))
    bus.on(this.getId(), this.onMessage.bind(this));
  }

  abstract getId(): string;
  abstract getState(): State;

  onMessage(_: Message): void { }

  publish(message: Message): void {
    this.bus.publish({
      id: this.getId(),
      value: message,
    });
  }

  sync() {
    this.bus.publish({
      id: this.getId(),
      value: {
        kind: "sync",
        value: this.getState(),
      },
    });
  }
}

export class DoorServer extends Controller<DoorState,DoorMessage> {
  static ID = "door";
  state: DoorState = { open: false }

  getId() { return DoorServer.ID; }
  getState() { return this.state; }

  onMessage(data: DoorMessage) {
    console.debug("[DOOR]",data)

    if (data.kind == "open") {
      this.state.open = true;
    }

    else if (data.kind == "close") {
      this.state.open = false;
    }

    else if (data.kind == "toggle") {
      this.state.open = !this.state.open;
    }

    else {
      return;
    }

    this.sync();
  }
}

export class McuServer extends Controller<McuState,McuMessage> {
  static ID = "mcu";
  state: McuState = {
    flash: false,
  }

  getId() { return McuServer.ID; }
  getState() { return this.state; }

  onMessage(message: McuMessage) {
    console.debug("[MCU]",message)

    if (message.kind == "flash:toggle") {
      this.state.flash = !this.state.flash;
      this.sync();
    }

    else if (message.kind == "flash:on") {
      this.state.flash = true;
      this.sync();
    }

    else if (message.kind == "flash:off") {
      this.state.flash = false;
      this.sync();
    }

    else if (message.kind == "capture") {
      this.publish({ kind: "capture" })
    }

  }
}

export class ImgServer extends Controller<{}, ImgMessage> {
  static ID = "img";
  getId() { return ImgServer.ID; }
  getState() { return {} }

  onMessage(message: ImgMessage): void {
    if (message.kind == "debug:binary") {
      // @ts-ignore
      this.bus.server.publish("imgbin", new Uint8Array([4,2,0]))
    }

    else if (message.kind == "attempt") {
      this.publish({ kind: "attempt" });
    }
  }

}

export default [ DoorServer, McuServer, ImgServer ] satisfies ({ new (bus: EventBus): any })[]
