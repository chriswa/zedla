import { assertExists } from '@/util/assertExists'
import { singleton } from 'tsyringe'

@singleton()
export class ImageLoader {
  protected images = new Map<string, HTMLImageElement>()
  protected flippedHorizCanvases = new Map<string, HTMLCanvasElement>()

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
        // Precompute a horizontally flipped canvas for this image
        const c = document.createElement('canvas')
        c.width = imgElement.width
        c.height = imgElement.height
        const ctx = c.getContext('2d')!
        ctx.translate(c.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(imgElement, 0, 0)
        this.flippedHorizCanvases.set(filepath, c)
        resolve()
      }
      imgElement.onerror = () => {
        throw new Error(`error loading image ${filepath}`)
      }
    })
  }

  async loadAll(filepaths: Array<string>) {
    const uniqueSrcs = Array.from(new Set(filepaths))
    await Promise.all(uniqueSrcs.map(async (src) => this.load(src)))
  }

  get(filepath: string): HTMLImageElement {
    return assertExists(this.images.get(filepath), `image ${filepath} not loaded`)
  }

  getFlippedHorizontally(filepath: string): HTMLCanvasElement {
    return assertExists(this.flippedHorizCanvases.get(filepath), `flipped image ${filepath} not loaded`)
  }
}
