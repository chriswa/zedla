import { singleton } from "tsyringe"

import { ecsEventSchema } from "./schemas/ecsEventSchema"

import { EventBus } from "@/util/eventBus"

const _gameEventSchema = {
  ...ecsEventSchema,
} as const

@singleton()
export class GameEventBus extends EventBus<typeof _gameEventSchema> {}
