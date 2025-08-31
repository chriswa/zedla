export interface FSMState {
  dispose(): void
}

export class FSM<TBase extends FSMState> {
  private activeState: TBase
  private queuedStateFactory: (() => TBase) | undefined
  constructor(initialState: TBase) {
    this.activeState = initialState
  }
  processQueuedState() {
    if (this.queuedStateFactory !== undefined) {
      this.activeState.dispose()
      const newState = this.queuedStateFactory()
      this.activeState = newState
      this.queuedStateFactory = undefined
    }
  }
  public get active(): TBase {
    return this.activeState
  }
  public queueStateFactory(v: () => TBase) {
    this.queuedStateFactory = v
  }
}
