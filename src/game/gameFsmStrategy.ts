import { GameContext } from '@/game/gameContext'
import { FsmStrategy } from '@/util/fsm'

export abstract class GameFsmStrategy implements FsmStrategy<GameContext> {
  abstract update(context: GameContext): GameFsmStrategy | undefined
  abstract onEnter(context: GameContext): void
  abstract onExit(context: GameContext): void
  abstract render(context: GameContext, renderBlend: number): void
}
