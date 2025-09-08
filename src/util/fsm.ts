export interface FSMState {
  onExit(): void
}

export class FSM<TBase extends FSMState> {
  private activeState: TBase
  private queuedStateFactory: (() => TBase) | undefined
  constructor(initialState: TBase) {
    this.activeState = initialState
  }
  processQueuedState(): boolean {
    if (this.queuedStateFactory === undefined) return false
    this.activeState.onExit()
    const newState = this.queuedStateFactory()
    this.activeState = newState
    this.queuedStateFactory = undefined
    return true
  }
  public get active(): TBase {
    return this.activeState
  }
  public queueStateFactory(v: () => TBase) {
    this.queuedStateFactory = v
  }
}
