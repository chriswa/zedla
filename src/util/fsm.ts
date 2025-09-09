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
