import { assertExists } from "@/util/assertExists";
import { singleton } from "tsyringe";

@singleton()
export class ImageLoader {
  private images: Map<string, HTMLImageElement> = new Map()
  constructor() {
  }
  load(filepath: string): Promise<void> {
    if (this.images.has(filepath)) {
      return Promise.resolve()
    }
    return new Promise((resolve, _reject) => {
      const imgElement = document.createElement('img')
      imgElement.src = `./${filepath}`
      imgElement.onload = (_ev) => {
        this.images.set(filepath, imgElement)
        resolve()
      }
      imgElement.onerror = (ev) => {
        throw new Error(`error loading image ${filepath}: ${ev.toString()}`)
      }
    })
  }
  async loadAll(filepaths: Array<string>) {
    const uniqueSrcs = Array.from(new Set(filepaths))
    await Promise.all(uniqueSrcs.map(src => this.load(src)))
  }
  get(filepath: string): HTMLImageElement {
    return assertExists(this.images.get(filepath), `image ${filepath} not loaded`)
  }
}
