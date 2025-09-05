import { Lifecycle, scoped, type Disposable } from "tsyringe";
import { type ISystem } from "./types";
import { ECS } from "../ecs";
import { RoomContext } from "@/game/roomContext";
import { npcKindRegistry } from "../../npc/npcKindRegistry";
import { GameEventBus } from "../../event/gameEventBus";
import type { NpcKindComponent } from "../components";

@scoped(Lifecycle.ContainerScoped)
export class NpcSystem implements ISystem, Disposable {
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
        npcKind.onDestroy?.(entityId)
      }
    })
  }

  tick() {
    this.ecs.entities.forEach((components, entityId) => {
      const npcKindComponent = components.NpcKindComponent
      if (npcKindComponent) {
        const npcKind = npcKindRegistry[npcKindComponent.kind]
        npcKind.tick(entityId, components, this.roomContext)
      }
    })
  }

  dispose() {
    this.unsubscribeFromEvents()
  }
}
