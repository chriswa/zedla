import { AnimationBehavior } from '@/game/agent/behaviors/animationBehavior'
import { singleton } from 'tsyringe'

const animationName = 'link'

@singleton()
export class PlayerAnimationBehavior extends AnimationBehavior<typeof animationName> {
  constructor() { super(animationName) }
}
