export interface FSMState {
  start(): void
  stop(): void
}

export class FSM<TBase extends FSMState> {
  private activeState: TBase | undefined
  private queuedState: TBase | undefined
  private isQueued = false
  constructor(initialState?: TBase | undefined) {
    this.activeState = initialState
  }
  processQueuedState() {
    if (this.isQueued) {
      this.activeState?.stop()
      this.queuedState?.start()
      this.activeState = this.queuedState
      this.isQueued = false
    }
  }
  public get active(): TBase | undefined {
    return this.activeState
  }
  public set queued(v: TBase | undefined) {
    this.queuedState = v
    this.isQueued = true
  }
}
