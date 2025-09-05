import { Lifecycle, scoped, type Disposable } from "tsyringe";

import { GameEventBus } from "../../event/gameEventBus";
import { npcKindRegistry } from "../../npc/npcKindRegistry";
import { ECS } from "../ecs";

import { type ITickingSystem } from "./types";

import type { NpcKindComponent } from "../components";

import { RoomContext } from "@/game/roomContext";



@scoped(Lifecycle.ContainerScoped)
export class NpcSystem implements ITickingSystem, Disposable {
  private unsubscribeFromEvents: () => void

  constructor(
    private ecs: ECS,
    private roomContext: RoomContext,
    private gameEventBus: GameEventBus,
  ) {
    this.unsubscribeFromEvents = this.gameEventBus.on('ecs:component_removing', (entityId, componentKey, component) => {
      if (componentKey === 'NpcKindComponent') {
        const npcKindComponent = component as NpcKindComponent
        const npcKind = npcKindRegistry[npcKindComponent.kind]
        npcKind.onDestroy(entityId)
      }
    })
  }

  tick() {
    for (const [entityId, components] of this.ecs.entities.entries()) {
      const npcKindComponent = components.NpcKindComponent
      if (npcKindComponent) {
        const npcKind = npcKindRegistry[npcKindComponent.kind]
        npcKind.tick(entityId, components, this.roomContext)
      }
    }
  }

  dispose() {
    this.unsubscribeFromEvents()
  }
}
