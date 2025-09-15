export interface FsmStrategy {
  onExit(): void
}

export class Fsm<TBase extends FsmStrategy> {
  private activeStrategy: TBase
  private queuedStrategyFactory: (() => TBase) | undefined
  constructor(initialStrategy: TBase) {
    this.activeStrategy = initialStrategy
  }

  processQueuedStrategy(): boolean {
    if (this.queuedStrategyFactory === undefined) return false
    this.activeStrategy.onExit()
    const newStrategy = this.queuedStrategyFactory()
    this.activeStrategy = newStrategy
    this.queuedStrategyFactory = undefined
    return true
  }

  public get active(): TBase {
    return this.activeStrategy
  }

  public queueStrategyFactory(v: () => TBase) {
    this.queuedStrategyFactory = v
  }
}

export interface DirectFsmStrategy<TContext> {
  update(context: TContext): DirectFsmStrategy<TContext> | undefined
  onEnter(context: TContext): void
  onExit(context: TContext): void
}

export class DirectFsm<TStrategy extends DirectFsmStrategy<TContext>, TContext> {
  private activeStrategy: TStrategy

  constructor(initialStrategy: TStrategy) {
    this.activeStrategy = initialStrategy
  }

  processTransitions(context: TContext, maxTransitions = 3): void {
    let transitions = 0

    for (;;) {
      const nextStrategy = this.activeStrategy.update(context) as TStrategy | undefined
      if (!nextStrategy) break

      const prevName = this.activeStrategy.constructor.name
      const nextName = nextStrategy.constructor.name

      // Call onExit with context before transition
      this.activeStrategy.onExit(context)

      this.activeStrategy = nextStrategy

      transitions += 1

      // console.log(`[DirectFsm] ${transitions}: ${prevName} -> ${nextName}`)
      if (transitions > maxTransitions) {
        throw new Error(`DirectFsm exceeded max transitions: ${prevName} -> ${nextName}`)
      }

      this.activeStrategy.onEnter(context)
    }
  }

  public get active(): TStrategy {
    return this.activeStrategy
  }
}
