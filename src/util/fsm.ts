export interface FsmStrategy<TContext> {
  update(context: TContext): FsmStrategy<TContext> | undefined
  onEnter(context: TContext): void
  onExit(context: TContext): void
}

export class Fsm<TStrategy extends FsmStrategy<TContext>, TContext> {
  private activeStrategy: TStrategy
  private hasCalledInitialOnEnter = false

  constructor(initialStrategy: TStrategy) {
    this.activeStrategy = initialStrategy
  }

  process(context: TContext, maxTransitions = 3): void {
    // Call initial onEnter if this is the first process call
    if (!this.hasCalledInitialOnEnter) {
      this.activeStrategy.onEnter(context)
      this.hasCalledInitialOnEnter = true
    }

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

      // console.log(`[Fsm] ${transitions}: ${prevName} -> ${nextName}`)
      if (transitions > maxTransitions) {
        throw new Error(`Fsm exceeded max transitions: ${prevName} -> ${nextName}`)
      }

      this.activeStrategy.onEnter(context)
    }
  }

  public get active(): TStrategy {
    return this.activeStrategy
  }
}
