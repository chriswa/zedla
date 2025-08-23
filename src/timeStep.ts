import { singleton } from "tsyringe"

export interface TimeStepHandle {
  setSpeed(speed: number): void
  deregister(): void
  step(): Promise<void>
}

type Callback = () => Promise<void>

interface RegisteredCallback {
  id: number
  priority: number
  framerate: number
  callback: Callback
  speed: number
  accumulator: number
  lastTime: number
}

interface DueCall {
  logicalTime: number
  priority: number
  registrationOrder: number
  cb: Callback
  reg: RegisteredCallback
}

let nextId = 0

@singleton()
export class TimeStep {
  private callbacks = new Set<RegisteredCallback>()

  constructor() {
    this.loop = this.loop.bind(this)
    requestAnimationFrame(this.loop)
  }

  public register(
    priority: number,
    framerate: number,
    callback: Callback
  ): TimeStepHandle {
    const now = performance.now()
    const entry: RegisteredCallback = {
      id: nextId++,
      priority,
      framerate,
      callback,
      speed: 1,
      accumulator: 0,
      lastTime: now,
    }

    this.callbacks.add(entry)

    return {
      setSpeed: (speed: number) => {
        entry.speed = speed
      },
      deregister: () => {
        this.callbacks.delete(entry)
      },
      step: async () => {
        await entry.callback()
      },
    }
  }

  private async loop(now: number) {
    const dueCalls: DueCall[] = []

    for (const reg of this.callbacks) {
      const dt = (now - reg.lastTime) * reg.speed
      reg.accumulator += dt
      reg.lastTime = now

      const interval = 1000 / reg.framerate
      let time = now - reg.accumulator

      while (reg.accumulator >= interval) {
        dueCalls.push({
          logicalTime: time += interval,
          priority: reg.priority,
          registrationOrder: reg.id,
          cb: reg.callback,
          reg,
        })
        reg.accumulator -= interval
      }
    }

    // Sort by logicalTime, priority, registration order
    dueCalls.sort((a, b) =>
      a.logicalTime !== b.logicalTime
        ? a.logicalTime - b.logicalTime
        : a.priority !== b.priority
        ? a.priority - b.priority
        : a.registrationOrder - b.registrationOrder
    )

    try {
      for (const { cb } of dueCalls) {
        await cb()
      }
    } catch (err: unknown) {
      console.error(`TimeStep halt!`, err)
      return
    }

    requestAnimationFrame(this.loop)
  }
}
