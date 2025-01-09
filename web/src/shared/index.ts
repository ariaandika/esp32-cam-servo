export const STATE_SYNC = "state:sync"

export interface Publisher {
  publish(data: Message): void;
}

/** unsafe serializable client server websocket message */
export interface Message {
  id: string
  value: any
}

export abstract class EventBus2 {
  event = new EventTarget();

  /** implement by child */
  abstract publish(data: Message): void;

  /** for external */
  on<T = any>(id: string, cb: (data: T) => any) {
    const fn = (event: any) => cb(event.detail)
    this.event.addEventListener(id, fn);
    return () => this.event.removeEventListener(id, fn);
  }

  /** for child */
  dispatch(data: Message | Message[]) {
    if (Array.isArray(data)) {
      data.forEach(this.dispatchEvent.bind(this));
    } else {
      this.dispatchEvent(data);
    }
  }

  // TODO: latest, create event that tell controller to publish their state

  private dispatchEvent(data: Message) {
    this.event.dispatchEvent(new CustomEvent(data.id, { detail: data.value }))
  }
}

