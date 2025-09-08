import { singleton } from 'tsyringe'

import { Input } from './input'

import { Game } from '@/game/game'
import { ImageLoader } from '@/gfx/imageLoader'
import { spriteFrameDefs } from '@/resources/spriteFrameDefs'
import { tilesetDefs } from '@/resources/tilesetDefs'
import { FixedTimeStep } from '@/util/fixedTimeStep'
import { CanvasLog } from '@/dev/canvasLog'

@singleton()
export class App {
  private _lastRafTs: number | undefined
  constructor(
    private imageLoader: ImageLoader,
    private input: Input,
    private game: Game,
    private fixedTimeStep: FixedTimeStep,
    private canvasLog: CanvasLog,
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
    // Update RAF delta permanent log
    if (this._lastRafTs !== undefined) {
      const dt = timestamp - this._lastRafTs
      this.canvasLog.upsertPermanent('raf-dt', `RAF dt: ${dt.toFixed(1)} ms`, 0)
    }
    this._lastRafTs = timestamp

    const renderBlend = this.fixedTimeStep.tick(timestamp, () => {
      this.input.sample()
      this.game.tick()
    })
    
    this.game.render(renderBlend)
    // Overlay dev canvas logs after world rendering
    this.canvasLog.render()
    requestAnimationFrame((timestamp) => this.rafCallback(timestamp))
  }
}
