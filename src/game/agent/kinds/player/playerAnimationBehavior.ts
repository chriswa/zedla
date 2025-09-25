import { AnimationBehavior } from '@/game/agent/behaviors/animationBehavior'
import { singleton } from 'tsyringe'

@singleton()
export class PlayerAnimationBehavior extends AnimationBehavior<'link'> {
  constructor() { super('link') }
}
