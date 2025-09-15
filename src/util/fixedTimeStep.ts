import { singleton } from 'tsyringe'

@singleton()
export class FixedTimeStep {
  private readonly PHYSICS_TIMESTEP = 1000 / 60 // 60 FPS
  private accumulator = 0
  private lastTime = 0

  tick(currentTime: number, physicsTick: () => void): number {
    const deltaTime = Math.min(currentTime - this.lastTime, 250) // cap at 250ms to prevent spiral of death
    this.lastTime = currentTime
    this.accumulator += deltaTime

    while (this.accumulator >= this.PHYSICS_TIMESTEP) {
      physicsTick()
      this.accumulator -= this.PHYSICS_TIMESTEP
    }

    return this.accumulator / this.PHYSICS_TIMESTEP // renderBlend [0,1]
  }
}
