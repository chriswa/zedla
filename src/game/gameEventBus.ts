import { type EnforceEventSchemaSubset, EventBus, type IsEventSchemaSubset, type ParamsOf, type SchemaOf } from "@/util/eventBus";
import { singleton } from "tsyringe";

const ecsEventSchema = {
  "ecs:foo": (_amount: number, _crit?: boolean): void => {},
  "ecs:bar": (_id: string, _kind: "orc" | "troll"): void => {},
} as const

class ECS<B extends EventBus<any>> {
  private bus: EventBus<typeof ecsEventSchema>

  constructor(
    bus: B & EnforceEventSchemaSubset<SchemaOf<B>, typeof ecsEventSchema>
  ) {
    // cast for DX to hide non-ECS keys; safe due to the constraint above
    this.bus = bus as unknown as EventBus<typeof ecsEventSchema>
  }

  sampleUsageCode() {
    const un = this.bus.on("ecs:foo", (n) => { n.toFixed() })
    this.bus.emit("ecs:foo", 1)
    // @ts-expect-error not part of ECS schema
    this.bus.on("combat:damage", () => {})
    un()
  }
}

const gameEventSchema = {
  ...ecsEventSchema,
} as const

@singleton()
class GameEventBus extends EventBus<typeof gameEventSchema> {}


// --- ECS module, self-contained, no dependency on GlobalBus or globalSchema ---

function _deadCode() {

  // --- module-local schemas (three prefixes) ---
  const ecsSchema = {
    "ecs:foo": (_amount: number, _crit?: boolean): void => {},
    "ecs:bar": (_id: string, _kind: "orc" | "troll"): void => {},
  } as const;

  const combatSchema = {
    "combat:damage": (_amt: number, _crit?: boolean): void => {},
    "combat:spawn": (_id: string): void => {},
  } as const;

  const uiSchema = {
    "ui:opened": (_screen: "menu" | "inventory"): void => {},
    "ui:closed": (): void => {},
  } as const;

  // --- global composition (value-merge for convenience) ---
  const globalSchema = { ...ecsSchema, ...combatSchema, ...uiSchema } as const;
  type GlobalSchema = typeof globalSchema;

  class GlobalBus extends EventBus<GlobalSchema> {}
  const globalBus = new GlobalBus();

  // baseline sanity
  globalBus.on("combat:spawn", (id) => { id.toUpperCase(); });
  globalBus.emit("ui:opened", "menu");
  // @ts-expect-error misspelled
  globalBus.emit("combat:spwn", "x");
  // @ts-expect-error wrong payload
  globalBus.emit("ecs:foo", "nope");

  // OK: Global contains all ECS keys with matching signatures
  const ecsOk = new ECS(globalBus);
  ecsOk; // silence unused

  // ---- failing cases (should error at the call site) ----

  // 1) Missing a key entirely
  type MissingEcsGlobal = typeof combatSchema & typeof uiSchema; // no ecs:*
  class MissingBus extends EventBus<MissingEcsGlobal> {}
  const missing = new MissingBus();
  // @ts-expect-error Global bus does not include ECS events
  new ECS(missing);

  // 2) Only one ECS key present (should still fail)
  const partialEcs = {
    ...combatSchema,
    ...uiSchema,
    "ecs:foo": (_amount: number, _crit?: boolean): void => {},
    // "ecs:bar" missing
  } as const;
  class PartialBus extends EventBus<typeof partialEcs> {}
  const partial = new PartialBus();
  // @ts-expect-error Not all ECS events are present
  new ECS(partial);

  // 3) Signature mismatch on one key
  const badEcs = {
    ...combatSchema,
    ...uiSchema,
    "ecs:foo": (_amount: string): void => {}, // wrong args
    "ecs:bar": (_id: string, _kind: "orc" | "troll"): void => {},
  } as const;
  class BadBus extends EventBus<typeof badEcs> {}
  const bad = new BadBus();
  // @ts-expect-error Signature mismatch
  new ECS(bad);

  // ---- debugging aid: inspect arg tuples the checker compares ----
  type _G = SchemaOf<GlobalBus>;
  type _E = typeof ecsEventSchema;
  type _Subset = IsEventSchemaSubset<_G, _E>; // should be true

  type _PerKey = {
    [K in keyof _E]:
      K extends keyof _G ? [ParamsOf<_G[K]>, ParamsOf<_E[K]>] : "missing";
  };
  // Hover _PerKey in your IDE: should show each pair of arg tuples, not `any[]`.

  // listenerCount key checking
  globalBus.listenerCount("ui:closed");
  // @ts-expect-error misspelled key
  globalBus.listenerCount("ui:close");
}
