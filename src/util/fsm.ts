export interface FsmStrategy<TContext, TReturn> {
  update(context: TContext): TReturn | undefined
  onEnter(context: TContext): void
  onExit(context: TContext): void
}

// Extract types from FsmStrategy
type ExtractContext<T> = T extends FsmStrategy<infer TContext, unknown> ? TContext : never
type ExtractReturn<T> = T extends FsmStrategy<unknown, infer TReturn> ? TReturn : never

export class Fsm<TStrategy extends FsmStrategy<unknown, unknown>> {
  private activeStrategy: TStrategy
  private hasCalledInitialOnEnter = false

  constructor(
    initialStrategy: TStrategy,
    private strategyResolver: (result: ExtractReturn<TStrategy>) => TStrategy = (result) => result as TStrategy,
  ) {
    this.activeStrategy = initialStrategy
  }

  process(context: ExtractContext<TStrategy>, maxTransitions = 3): void {
    // Call initial onEnter if this is the first process call
    if (!this.hasCalledInitialOnEnter) {
      this.activeStrategy.onEnter(context)
      this.hasCalledInitialOnEnter = true
    }

    let transitions = 0

    for (;;) {
      const result = this.activeStrategy.update(context)
      if (result === undefined) { break }

      const nextStrategy = this.strategyResolver(result as ExtractReturn<TStrategy>)
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
