import { singleton } from "tsyringe";

import { assertExists } from "@/util/assertExists";

@singleton()
export class ImageLoader {
  private images = new Map<string, HTMLImageElement>()
  constructor() {
  }
  async load(filepath: string): Promise<void> {
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
      imgElement.onerror = () => {
        throw new Error(`error loading image ${filepath}`)
      }
    })
  }
  async loadAll(filepaths: Array<string>) {
    const uniqueSrcs = Array.from(new Set(filepaths))
    await Promise.all(uniqueSrcs.map(async src => this.load(src)))
  }
  get(filepath: string): HTMLImageElement {
    return assertExists(this.images.get(filepath), `image ${filepath} not loaded`)
  }
}
