import Human, { type Result } from '@vladmandic/human'

export class FaceApi {
  private config: Partial<Human["config"]> = {
    // async: false,
    body: { enabled: false },
    gesture: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
    segmentation: { enabled: false },
    backend: "webgl",
    modelBasePath: "/",
  };

  human = new Human(this.config);

  private event = new EventTarget();

  on(event: "canvas" | "face" | "finish", cb: () => any) {
    this.event.addEventListener(event, cb);
    return () => this.event.removeEventListener(event, cb);
  }

  async process(img: HTMLImageElement | HTMLVideoElement, canvas?: HTMLCanvasElement) {
    // OFF BY ONE DETECTION
    const _ = await this.human.detect(img)
    const result = await this.human.detect(img)

    if (canvas) {
      this.human.draw.canvas(result.canvas ?? canvas, canvas);
      this.human.draw.face(canvas, result.face, { faceLabels: "", drawBoxes: false });
    }

    return result;
  }

  async find(img: HTMLImageElement, db: any[]) {
    // OFF BY ONE DETECTION
    const _ = await this.human.detect(img)
    const result = await this.human.detect(img)
    this.event.dispatchEvent(new Event("canvas"));
    console.log(db)

    // this.human.draw.canvas(result.canvas ?? canvas, canvas);
    // this.human.draw.face(canvas, result.face, { faceLabels: "", drawBoxes: false });

    this.event.dispatchEvent(new CustomEvent("finish",{ detail: { result } }));

    if (result.face.length == 0) {
      throw new Error("Tidak ada wajah terdeteksi")
    }

    return this.human.match.find(result.face[0].embedding!, db)
  }
}

