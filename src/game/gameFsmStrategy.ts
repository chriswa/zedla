import { GameContext } from '@/game/gameContext'
import { FsmStrategy } from '@/util/fsm'

export abstract class GameFsmStrategy implements FsmStrategy<GameContext, GameFsmStrategy> {
  abstract update(context: GameContext): GameFsmStrategy | undefined
  onEnter(_context: GameContext): void {}
  onExit(_context: GameContext): void {}
  abstract render(context: GameContext, renderBlend: number): void
}
