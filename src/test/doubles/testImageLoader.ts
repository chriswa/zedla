import { ImageLoader } from '@/gfx/imageLoader'
import { createStrictMock } from '@/util/createStrictMock'
import { singleton } from 'tsyringe'

/**
 * Test double for ImageLoader that extends the real ImageLoader
 * Overrides load methods to skip actual DOM/network work
 */
@singleton()
export class TestImageLoader extends ImageLoader {
  async load(filepath: string): Promise<void> {
    // Skip actual loading but populate the maps with stub data
    if (!this.images.has(filepath)) {
      // Create stub image and canvas objects
      const stubImage = createStrictMock<HTMLImageElement>({
        width: 32,
        height: 32,
        src: filepath,
      })
      const stubCanvas = createStrictMock<HTMLCanvasElement>({
        width: 32,
        height: 32,
      })

      this.images.set(filepath, stubImage)
      this.flippedHorizCanvases.set(filepath, stubCanvas)
    }
    return Promise.resolve()
  }

  async loadAll(filepaths: Array<string>): Promise<void> {
    // Skip actual loading - just populate all with stubs
    const uniqueSrcs = Array.from(new Set(filepaths))
    await Promise.all(uniqueSrcs.map(async (src) => this.load(src)))
  }
}
