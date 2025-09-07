import { singleton } from 'tsyringe'

import { Input } from './input'

import { Game } from '@/game/game'
import { ImageLoader } from '@/gfx/imageLoader'
import { spriteFrameDefs } from '@/resources/spriteFrameDefs'
import { tilesetDefs } from '@/resources/tilesetDefs'
import { FixedTimeStep } from '@/util/fixedTimeStep'

@singleton()
export class App {
  constructor(
    private imageLoader: ImageLoader,
    private input: Input,
    private game: Game,
    private fixedTimeStep: FixedTimeStep,
  ) {}

  // TODO: FSM with game selection (e.g. new game (choose difficulty) or continue) (this FSM is separate from Game's FSM)

  async boot() {
    await this.loadAllResources()
    requestAnimationFrame((timestamp) => this.rafCallback(timestamp))
    this.game.boot()
  }

  async loadAllResources() {
    await this.imageLoader.loadAll([
      ...Object.values(spriteFrameDefs).map(f => f.src),
      ...Object.values(tilesetDefs).map(f => f.src),
    ])
  }

  private rafCallback(timestamp: number): void {
    this.input.sample()
    
    const renderBlend = this.fixedTimeStep.tick(timestamp, () => {
      this.game.tick()
    })
    
    this.game.render(renderBlend)
    requestAnimationFrame((timestamp) => this.rafCallback(timestamp))
  }
}
