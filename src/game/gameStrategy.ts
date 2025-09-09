import type { FSMStrategy } from "@/util/fsm";

export abstract class GameStrategy implements FSMStrategy {
  tick() {}
  render(_renderBlend: number) {}
  onExit() {}
}
