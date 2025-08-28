import { EventBus } from "@/util/eventBus";
import { singleton } from "tsyringe";

const playerEventSchema = {
  "player:moved": (_pos: { x: number; y: number }) => void 0,
  "player:leveled": (_level: number) => void 0,
} as const

const combatEventSchema = {
  "damage:dealt": (_amount: number, _crit?: boolean) => void 0,
  "enemy:spawned": (_id: string, _kind: "orc" | "troll") => void 0,
} as const

const gameEventSchema = {
  ...playerEventSchema,
  ...combatEventSchema,
} as const

@singleton()
export class GameBus extends EventBus<typeof gameEventSchema> {}



class SampleConsumer {
  constructor(
    private gameBus: GameBus,
  ) {
    // ✅ correct
    const unsub = gameBus.on("player:moved", (pos) => {
      pos.x // number
      pos.y // number
    })

    // ✅ once()
    gameBus.once("enemy:spawned", (id, kind) => {
      // id: string, kind: "orc" | "troll"
    })

    // ✅ emit with correct args
    gameBus.emit("damage:dealt", 42, true)

    // ❌ compile-time errors:
    // @ts-expect-error – misspelled name
    gameBus.on("player:mvoed", () => {})
    // @ts-expect-error – wrong arg types
    gameBus.emit("damage:dealt", "a lot")
    unsub()
  }
}





