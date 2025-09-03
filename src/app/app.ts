import { singleton } from 'tsyringe'
import { ImageLoader } from '@/gfx/imageLoader'
import { Game } from '@/game/game'
import { imageSliceDefs } from '@/resources/imageSliceDefs'
import { tilesetDefs } from '@/resources/tilesetDefs'
import { Input } from './input'
import { FixedTimeStep } from '@/util/fixedTimeStep'

@singleton()
export class App {
  constructor(
    private imageLoader: ImageLoader,
    private input: Input,
    private game: Game,
    private fixedTimeStep: FixedTimeStep,
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

  private rafCallback(timestamp: number): void {
    this.input.sample()
    
    const renderBlend = this.fixedTimeStep.tick(timestamp, () => {
      this.game.tick()
    })
    
    this.game.render(renderBlend)
    requestAnimationFrame(this.rafCallback)
  }
}
