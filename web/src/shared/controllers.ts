
export type DoorMessage =
  | {
    kind: "toggle" | "open" | "close";
  }
  | {
    kind: "sync"
    value: DoorState
  }

export interface DoorState {
  open: boolean
}

export type McuMessage =
  | {
    kind: "sync"
    value: McuState
  }
  | { kind: "flash:toggle" }
  | { kind: "flash:off" }
  | { kind: "flash:on" }
  | { kind: "capture" }

export interface McuState {
  flash: boolean
}

export type PictureMessage =
  | {
    kind: "sync"
    value: ImgState
  }
  | {
    kind: "clear"
  }

export interface ImgState {
  users: string[]
  attempts: {
    success: boolean,
    href: string
  }[]
}

export type ImgMessage =
  | { kind: "register" }
  | { kind: "attempt" }
  | { kind: "debug:binary" }
  | {
    kind: "client:binary"
    blob: Blob
  }

