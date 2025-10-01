import { TimerBehavior } from '@/game/agent/behaviors/timerBehavior'
import { singleton } from 'tsyringe'

export type PlayerTimerKey = 'coyoteTime' | 'jumpInputBuffer'

@singleton()
export class PlayerTimerBehavior extends TimerBehavior<PlayerTimerKey> {}
