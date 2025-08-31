import { EventBus } from "@/util/eventBus"
import { singleton } from "tsyringe"
import { ecsEventSchema } from "./schemas/ecsEventSchema"

const gameEventSchema = {
  ...ecsEventSchema,
} as const

@singleton()
export class GameEventBus extends EventBus<typeof gameEventSchema> {}
