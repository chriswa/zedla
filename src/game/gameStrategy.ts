import type { FSMState } from "@/util/fsm";

export abstract class GameStrategy implements FSMState {
  tick() {}
  render(_renderBlend: number) {}
  onExit() {}
}
