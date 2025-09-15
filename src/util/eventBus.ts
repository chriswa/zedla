// EventBus.ts — class-based bus + compile-time subset enforcement (self-contained)
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-parameters, @typescript-eslint/no-empty-object-type */

/* ====================== Types ====================== */

export type EventSchema = Record<string, (...a: any) => void>

export type ParamsOf<T> = T extends (...a: infer A) => any ? Readonly<A> : never

// bidirectional (exact) equality
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
    ? ((<T>() => T extends B ? 1 : 2) extends (<T>() => T extends A ? 1 : 2) ? true : false)
    : false

/** Sub ⊆ Super and, for every key in Sub, argument tuples match **exactly**. */
export type IsEventSchemaSubset<
  Super extends EventSchema,
  Sub extends EventSchema,
> =
  [Exclude<keyof Sub, keyof Super>] extends [never]
    ? (
  // guard the index so TS is happy about Super[K]
      {
        [K in keyof Sub]:
        K extends keyof Super
          ? IsEqual<ParamsOf<Super[K]>, ParamsOf<Sub[K]>>
          : false
      }[keyof Sub] extends true ? true : false
    )
    : false

/** Use in constructor params to enforce at the call site that `Sub` ⊆ `Super`. */
export type EnforceEventSchemaSubset<
  Super extends EventSchema,
  Sub extends EventSchema,
> = IsEventSchemaSubset<Super, Sub> extends true ? {} : never

/** Extract the *exact* schema from any EventBus (relies on a phantom field). */
export type SchemaOf<B extends EventBus<any>> = B[typeof __schemaSym]

/* ====================== Class ====================== */

// unique symbol so extraction is precise & doesn’t collide
const __schemaSym: unique symbol = Symbol.for('eventbus.schema')

export class EventBus<S extends EventSchema> {
  // phantom, type-only carrier for S (no runtime cost)
  public declare readonly [__schemaSym]: S

  private listeners: { [K in keyof S]?: Set<(...a: ParamsOf<S[K]>) => void> } = {}

  on<E extends keyof S>(event: E, fn: (...a: ParamsOf<S[E]>) => void) {
    (this.listeners[event] ??= new Set()).add(fn)
    return () => this.off(event, fn)
  }

  once<E extends keyof S>(event: E, fn: (...a: ParamsOf<S[E]>) => void) {
    const wrap = ((...a: ParamsOf<S[E]>) => { this.off(event, wrap); fn(...a) }) as
      (...a: ParamsOf<S[E]>) => void
    return this.on(event, wrap)
  }

  off<E extends keyof S>(event: E, fn: (...a: ParamsOf<S[E]>) => void) {
    this.listeners[event]?.delete(fn)
  }

  emit<E extends keyof S>(event: E, ...a: ParamsOf<S[E]>) {
    if (this.listeners[event]) for (const fn of this.listeners[event]) fn(...a)
  }

  clear<E extends keyof S>(event?: E) {
    if (event) this.listeners[event]?.clear()
    else for (const s of (Object.values(this.listeners) as Array<Set<any> | undefined>)) s?.clear()
  }

  listenerCount<E extends keyof S>(event: E) {
    return this.listeners[event]?.size ?? 0
  }
}
