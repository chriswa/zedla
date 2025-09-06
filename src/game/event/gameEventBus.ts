import { singleton } from "tsyringe"

import { ecsEventSchema } from "./schemas/ecsEventSchema"
import { combatEventSchema } from "./schemas/combatEventSchema"

import { EventBus } from "@/util/eventBus"

const _gameEventSchema = {
  ...ecsEventSchema,
  ...combatEventSchema,
} as const

@singleton()
export class GameEventBus extends EventBus<typeof _gameEventSchema> {}
