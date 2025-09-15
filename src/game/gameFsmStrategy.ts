import { FsmStrategy as FsmStrategy } from '@/util/fsm'

export abstract class GameFsmStrategy implements FsmStrategy {
  tick() {}
  render(_renderBlend: number) {}
  onExit() {}
}
