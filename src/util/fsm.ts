export interface FSMStrategy {
  onExit(): void
}

export class FSM<TBase extends FSMStrategy> {
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

export interface DirectFSMStrategy<TContext> {
  update(context: TContext): DirectFSMStrategy<TContext> | undefined
  onEnter(context: TContext): void
  onExit(context: TContext): void
}

export class DirectFSM<TStrategy extends DirectFSMStrategy<TContext>, TContext> {
  private activeStrategy: TStrategy
  
  constructor(initialStrategy: TStrategy) {
    this.activeStrategy = initialStrategy
  }
  
  processTransitions(context: TContext, maxTransitions: number = 3): void {
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
      // eslint-disable-next-line no-console
      console.log(`[DirectFSM] ${transitions}: ${prevName} -> ${nextName}`)
      if (transitions > maxTransitions) {
        throw new Error(`DirectFSM exceeded max transitions: ${prevName} -> ${nextName}`)
      }
      
      this.activeStrategy.onEnter(context)
    }
  }
  
  public get active(): TStrategy {
    return this.activeStrategy
  }
}
