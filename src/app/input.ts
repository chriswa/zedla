import { singleton } from "tsyringe";

export enum Button {
  UP,
  DOWN,
  LEFT,
  RIGHT,
  ATTACK,
  JUMP,
}

const keyboardEventCodeToButton: Record<string, Button> = {
  ArrowUp: Button.UP,
  ArrowDown: Button.DOWN,
  ArrowLeft: Button.LEFT,
  ArrowRight: Button.RIGHT,
  KeyZ: Button.ATTACK,
  KeyX: Button.JUMP,
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
      if (button !== undefined) {
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
  }
  isDown(button: Button) {
    return this.sampledDown.has(button)
  }
  wasHitThisTick(button: Button) {
    return this.sampledHit.has(button)
  }
}