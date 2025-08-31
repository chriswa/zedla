import { singleton } from 'tsyringe'
import { ImageLoader } from '@/gfx/imageLoader'
import { Game } from '@/game/game'
import { imageSliceDefs } from '@/resources/imageSliceDefs'
import { tilesetDefs } from '@/resources/tilesetDefs'

@singleton()
export class App {
  constructor(
    private imageLoader: ImageLoader,
    private game: Game,
  ) {
    this.rafCallback = this.rafCallback.bind(this)
  }

  // TODO: FSM with game selection (e.g. new game (choose difficulty) or continue) (this FSM is separate from Game's FSM)

  async boot() {
    await this.loadAllResources()
    requestAnimationFrame(this.rafCallback)
    this.game.boot()
  }

  async loadAllResources() {
    await this.imageLoader.loadAll([
      ...Object.values(imageSliceDefs).map(f => f.src),
      ...Object.values(tilesetDefs).map(f => f.src),
    ])
  }

  private rafCallback(_timestamp: number): void {
    // TODO: fix your timestep
    this.game.tick()
    this.game.render()
    requestAnimationFrame(this.rafCallback)
  }
}
