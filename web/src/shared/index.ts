
export interface Publisher {
  publish(data: Message): void;
}

/** unsafe serializable websocket message */
export interface Message {
  id: string
  value: any
}

/** client or server EventBus */
export abstract class EventBus {
  event = new EventTarget();

  /** publish through external network connection */
  abstract publish(data: Message): void;

  /** add event listener */
  on<T = any>(id: string, cb: (data: T) => any) {
    const fn = (event: any) => cb(event.detail)
    this.event.addEventListener(id, fn);
    return () => this.event.removeEventListener(id, fn);
  }

  /** dispatch internal event listeners */
  dispatch(data: Message | Message[]) {
    if (Array.isArray(data)) {
      data.forEach(this.dispatchEvent.bind(this));
    } else {
      this.dispatchEvent(data);
    }
  }

  private dispatchEvent(data: Message) {
    this.event.dispatchEvent(new CustomEvent(data.id, { detail: data.value }))
  }
}

