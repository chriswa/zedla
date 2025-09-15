import { ecsEventSchema } from '@/game/event/schemas/ecsEventSchema'
import { EventBus } from '@/util/eventBus'
import { singleton } from 'tsyringe'

const _gameEventSchema = {
  ...ecsEventSchema,
} as const

@singleton()
export class GameEventBus extends EventBus<typeof _gameEventSchema> {}
