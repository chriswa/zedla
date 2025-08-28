// EventBus — class-based, fully-typed event bus with composable narrowing

// ========== Types ==========

/** Map a signature-stub schema `{ "evt": (...args) => void }` to readonly arg tuples per key. */
export type ParamsMap<S> = {
  [K in keyof S]: S[K] extends (...a: infer A) => any ? Readonly<A> : never
}

/** Pick keys that start with any of the given prefix literals. */
export type PickByAnyPrefix<S, P extends readonly string[]> = {
  [K in keyof S as K extends `${P[number]}${string}` ? K : never]: S[K]
}

/** Emit-only surface over a schema subset. */
export type EmitOnly<S> = {
  emit<E extends keyof S>(event: E, ...a: ParamsMap<S>[E]): void
}

/** Listen-only surface over a schema subset. */
export type ListenOnly<S> = {
  on  <E extends keyof S>(event: E, fn: (...a: ParamsMap<S>[E]) => void): () => void
  once<E extends keyof S>(event: E, fn: (...a: ParamsMap<S>[E]) => void): () => void
  off <E extends keyof S>(event: E, fn: (...a: ParamsMap<S>[E]) => void): void
  clear<E extends keyof S>(event?: E): void
  listenerCount<E extends keyof S>(event: E): number
}

export type Cap = "rw" | "emit" | "listen"

/** Narrowing/transform methods that remain chainable on any view (capability preserved). */
export type NarrowFns<S, C extends Cap> = {
  // one method, multi-prefix capable (works for single prefix too)
  toPrefixNarrowed<const P extends readonly string[]>(prefixes: P): View<PickByAnyPrefix<S, P>, C>;
  toEmitOnly():   View<S, "emit">;
  toListenOnly(): View<S, "listen">;
};

/** Typed view: schema subset S + capability C (+ chainable narrowers). */
export type View<S, C extends Cap> =
  (C extends "emit"   ? EmitOnly<S>                 : unknown) &
  (C extends "listen" ? ListenOnly<S>               : unknown) &
  (C extends "rw"     ? EmitOnly<S> & ListenOnly<S> : unknown) &
  NarrowFns<S, C>


// ========== Class ==========

/**
 * Schema-bound event bus.
 * S is your signature-stub schema: `{ "evt": (...args) => void } as const`
 */
export class EventBus<S extends Record<string, (...a: any) => void>> {
  private listeners: { [K in keyof S]?: Set<(...a: ParamsMap<S>[K]) => void> } = {}

  // Full surface (read+write). Views type-trim this as needed.
  on<E extends keyof S>(event: E, fn: (...a: ParamsMap<S>[E]) => void) {
    (this.listeners[event] ??= new Set()).add(fn)
    return () => this.off(event, fn)
  }

  once<E extends keyof S>(event: E, fn: (...a: ParamsMap<S>[E]) => void) {
    const wrap = ((...a: ParamsMap<S>[E]) => { this.off(event, wrap); fn(...a) }) as
      (...a: ParamsMap<S>[E]) => void
    return this.on(event, wrap)
  }

  off<E extends keyof S>(event: E, fn: (...a: ParamsMap<S>[E]) => void) {
    this.listeners[event]?.delete(fn)
  }

  emit<E extends keyof S>(event: E, ...a: ParamsMap<S>[E]) {
    this.listeners[event]?.forEach(fn => fn(...a))
  }

  clear<E extends keyof S>(event?: E) {
    if (event) this.listeners[event]?.clear()
    else (Object.values(this.listeners) as Array<Set<any> | undefined>).forEach(s => s?.clear())
  }

  listenerCount<E extends keyof S>(event: E) {
    return this.listeners[event]?.size ?? 0
  }

  // Composable typed views (return `this` re-typed; zero runtime overhead).
  private asView<T>() { return this as unknown as T }

  /** Narrow by multiple prefixes; preserves current capability when chaining. */
  toPrefixNarrowed<const P extends readonly string[], C extends Cap = "rw">(_prefixes: P): View<PickByAnyPrefix<S, P>, C> {
    return this.asView<View<PickByAnyPrefix<S, P>, C>>()
  }

  /** Convert to emit-only (keeps current key subset). */
  toEmitOnly() {
    return this.asView<View<S, "emit">>()
  }

  /** Convert to listen-only (keeps current key subset). */
  toListenOnly() {
    return this.asView<View<S, "listen">>()
  }
}



// Sample usage/tests for your EventBus with `toPrefixNarrowed(...)`, `toEmitOnly()`, and `toListenOnly()` chaining in either order.

function _intentionallyDeadCode() {

  // ---------- Schema with 3 distinct prefixes ----------
  const player = {
    "player:moved": (_p: { x: number; y: number }) => void 0,
    "player:leveled": (_lvl: number) => void 0,
  } as const;

  const combat = {
    "combat:damage": (_amt: number, _crit?: boolean) => void 0,
    "combat:spawn": (_id: string) => void 0,
  } as const;

  const ui = {
    "ui:opened": (_screen: "menu" | "inventory") => void 0,
    "ui:closed": () => void 0,
  } as const;

  type Schema = typeof player & typeof combat & typeof ui;

  // You have your EventBus class from earlier:
  const bus = new EventBus<Schema>

  // ---------- Baseline sanity ----------
  bus.on("player:moved", (p) => { p.x; p.y; });
  bus.emit("combat:spawn", "e1");
  // @ts-expect-error misspelled event name is rejected
  bus.emit("combat:spwn", "e1");
  // @ts-expect-error wrong payload type
  bus.emit("ui:opened", "settings");

  // ========== ORDER A: prefix → emit-only / listen-only ==========

  // A1) Prefix then emit-only (single prefix)
  const playerTx = bus.toPrefixNarrowed(["player:"] as const).toEmitOnly();
  playerTx.emit("player:moved", { x: 1, y: 2 });
  // @ts-expect-error emit-only view has no `on`
  playerTx.on("player:moved", () => {});
  // @ts-expect-error outside prefix not allowed
  playerTx.emit("combat:spawn", "e2");

  // A2) Prefix then listen-only (two prefixes)
  const gameplayRx = bus.toPrefixNarrowed(["player:", "combat:"] as const).toListenOnly();
  const un = gameplayRx.on("player:leveled", (lvl) => { lvl.toFixed(); });
  gameplayRx.on("combat:damage", (amt, crit) => { amt.toFixed(); });
  // @ts-expect-error listen-only view has no `emit`
  gameplayRx.emit("player:leveled", 2);
  // @ts-expect-error outside both prefixes (ui:*) is rejected
  gameplayRx.on("ui:opened", () => {});
  un(); // unsubscribe returns a function

  // A3) Prefix (two prefixes) then further prefix (narrow again)
  const playersOnlyRx = gameplayRx.toPrefixNarrowed(["player:"] as const);
  // OK
  playersOnlyRx.on("player:moved", () => {});
  // @ts-expect-error `combat:*` no longer in scope after further narrowing
  playersOnlyRx.on("combat:spawn", () => {});

  // ========== ORDER B: emit-only / listen-only → prefix ==========

  // B1) Emit-only then prefix (single prefix)
  const combatTx = bus.toEmitOnly().toPrefixNarrowed(["combat:"] as const);
  combatTx.emit("combat:damage", 10, true);
  // @ts-expect-error still emit-only after narrowing
  combatTx.on("combat:spawn", () => {});
  // @ts-expect-error outside prefix
  combatTx.emit("player:leveled", 3);

  // B2) Listen-only then prefix (two prefixes)
  const uiAndPlayerRx = bus.toListenOnly().toPrefixNarrowed(["ui:", "player:"] as const);
  uiAndPlayerRx.on("ui:opened", (screen) => { screen satisfies "menu" | "inventory"; });
  uiAndPlayerRx.on("player:moved", ({ x, y }) => { x; y; });
  // @ts-expect-error listen-only view cannot emit
  uiAndPlayerRx.emit("ui:opened", "menu");
  // @ts-expect-error combat:* not allowed here
  uiAndPlayerRx.on("combat:damage", () => {});

  // B3) Listen-only then prefix (three prefixes union)
  const allRx = bus.toListenOnly().toPrefixNarrowed(["player:", "combat:", "ui:"] as const);
  allRx.on("player:leveled", () => {});
  allRx.on("combat:spawn", () => {});
  allRx.on("ui:closed", () => {});
  // still listen-only:
  // @ts-expect-error
  allRx.emit("player:leveled", 9);

  // ========== Edge cases & gotchas ==========

  // E1) Empty prefix list → no keys (never). Everything is an error.
  const noneRx = bus.toListenOnly().toPrefixNarrowed([] as const);
  // @ts-expect-error no events match
  noneRx.on("player:moved", () => {});
  // @ts-expect-error no events match
  noneRx.listenerCount("ui:closed");

  // E2) Non-literal/widened prefix arrays lose narrowing.
  // (This compiles but DOES NOT narrow; shown as comments for clarity.)
  const dynamic: string[] = ["player:"];            // widened
  // const badNarrow = bus.toEmitOnly().toPrefixNarrowed(dynamic);
  // badNarrow.emit("combat:spawn", "e3"); // <-- this would compile because the array is widened
  // Fix by declaring readonly literal tuples:
  const good = ["player:"] as const;
  bus.toEmitOnly().toPrefixNarrowed(good).emit("player:moved", { x: 0, y: 0 });

  // E3) Argument shape still enforced after narrowing
  const uiTx = bus.toEmitOnly().toPrefixNarrowed(["ui:"] as const);
  // @ts-expect-error ui:opened expects "menu" | "inventory"
  uiTx.emit("ui:opened", "settings");
  uiTx.emit("ui:opened", "menu");

  // E4) Further narrowing preserves capability (emit-only stays emit-only)
  const uiTxMore = uiTx.toPrefixNarrowed(["ui:"] as const);
  uiTxMore.emit("ui:closed");
  // @ts-expect-error still emit-only
  uiTxMore.on("ui:closed", () => {});
}
