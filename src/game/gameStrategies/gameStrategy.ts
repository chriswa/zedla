import type { FSMState } from "@/util/fsm";

export abstract class GameStrategy implements FSMState {
  start() {}
  stop() {}
  update() {}
  render() {}
}
