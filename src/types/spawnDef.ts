import { entityKinds } from "@/game/room/entity/roomEntityKinds"
import type { ConstructorParams } from "@/util/type/constructorParams"
import type { SkipFirst } from "@/util/type/skipFirst"
import type { TakeFirst } from "@/util/type/takeFirst"

type InjectedRoomEntityCtorParamCount = 1

export type RoomEntityDef = {
  [K in keyof typeof entityKinds]: {
    kind: K
    args: SkipFirst<InjectedRoomEntityCtorParamCount, ConstructorParams<typeof entityKinds[K]>>
  }
}[keyof typeof entityKinds]

type CtorInjectedArgs = {
  [K in keyof typeof entityKinds]: TakeFirst<InjectedRoomEntityCtorParamCount, ConstructorParams<typeof entityKinds[K]>>
}

// 2. Make sure all injected arg types are the same across all constructors
type Values<T> = T[keyof T]
type AllInjectedArgTypes = Values<CtorInjectedArgs>
// 3. Assert all injected arg types are the same
type AssertSameInjectedArgs<T extends AllInjectedArgTypes> =
  AllInjectedArgTypes extends T ? T : never
export type RoomEntityInjectedArgs = AssertSameInjectedArgs<AllInjectedArgTypes>
