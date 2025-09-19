import { FsmStrategy } from '@/util/fsm'
import { GameContext } from '@/game/gameContext'

export abstract class GameFsmStrategy implements FsmStrategy<GameContext> {
  abstract update(context: GameContext): GameFsmStrategy | undefined
  abstract onEnter(context: GameContext): void
  abstract onExit(context: GameContext): void
  abstract render(context: GameContext, renderBlend: number): void
}
