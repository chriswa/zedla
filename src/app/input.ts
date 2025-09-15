import * as KeyCode from 'keycode-js'
import { singleton } from 'tsyringe'

export enum Button {
  // UP,
  DOWN,
  LEFT,
  RIGHT,
  ATTACK,
  JUMP,
}

const keyboardEventCodeToButton: Record<string, Button> = {
  // [KeyCode.CODE_UP]: Button.UP,
  [KeyCode.CODE_DOWN]: Button.DOWN,
  [KeyCode.CODE_LEFT]: Button.LEFT,
  [KeyCode.CODE_RIGHT]: Button.RIGHT,
  [KeyCode.CODE_Z]: Button.ATTACK,
  [KeyCode.CODE_X]: Button.JUMP,

  [KeyCode.CODE_A]: Button.LEFT,
  [KeyCode.CODE_D]: Button.RIGHT,
  [KeyCode.CODE_S]: Button.DOWN,
  [KeyCode.CODE_SLASH]: Button.JUMP,
  [KeyCode.CODE_PERIOD]: Button.ATTACK,
}

@singleton()
export class Input {
  private volatileDown = new Set<Button>()
  private volatileHit = new Set<Button>()

  private sampledDown = new Set<Button>()
  private sampledHit = new Set<Button>()

  constructor() {
    document.addEventListener('keydown', (keyboardEvent) => {
      const button = keyboardEventCodeToButton[keyboardEvent.code]
      if (button !== undefined && !this.volatileDown.has(button)) {
        this.volatileDown.add(button)
        this.volatileHit.add(button)
      }
    })
    document.addEventListener('keyup', (keyboardEvent) => {
      const button = keyboardEventCodeToButton[keyboardEvent.code]
      if (button !== undefined) {
        this.volatileDown.delete(button)
      }
    })
    // TODO: capture tab focus lost/gained and reset all state!
  }

  sample() {
    this.sampledDown.clear()
    for (const button of this.volatileDown) {
      this.sampledDown.add(button)
    }
    this.sampledHit.clear()
    for (const button of this.volatileHit) {
      this.sampledHit.add(button)
    }
    // Hits are edge-triggered; clear after sampling so they last one frame
    this.volatileHit.clear()
  }

  isDown(button: Button) {
    return this.sampledDown.has(button)
  }

  wasHitThisTick(button: Button) {
    return this.sampledHit.has(button)
  }

  getHorizontalInputDirection(): -1 | 0 | 1 {
    const leftValue = this.isDown(Button.LEFT) ? -1 : 0
    const rightValue = this.isDown(Button.RIGHT) ? 1 : 0
    return (leftValue + rightValue) as -1 | 0 | 1
  }

  getVerticalInputDirection(): -1 | 0 | 1 {
    const upValue = 0 // Button.UP not currently defined
    const downValue = this.isDown(Button.DOWN) ? 1 : 0
    return (upValue + downValue) as -1 | 0 | 1
  }
}
