import { Lifecycle, scoped, type Disposable } from "tsyringe";

import { GameEventBus } from "../../event/gameEventBus";
import { agentKindRegistry } from "../../agent/agentKindRegistry";
import { ECS } from "../ecs";

import { type ITickingSystem } from "./types";

import type { AgentKindComponent } from "../components";

import { RoomContext } from "@/game/roomContext";



@scoped(Lifecycle.ContainerScoped)
export class AgentSystem implements ITickingSystem, Disposable {
  private unsubscribeFromEvents: () => void

  constructor(
    private ecs: ECS,
    private roomContext: RoomContext,
    private gameEventBus: GameEventBus,
  ) {
    this.unsubscribeFromEvents = this.gameEventBus.on('ecs:component_removing', (entityId, componentKey, component) => {
      if (componentKey === 'AgentKindComponent') {
        const agentKindComponent = component as AgentKindComponent
        const agentKind = agentKindRegistry[agentKindComponent.kind]
        agentKind.onDestroy(entityId)
      }
    })
  }

  tick() {
    for (const [entityId, components] of this.ecs.entities.entries()) {
      const agentKindComponent = components.AgentKindComponent
      if (agentKindComponent) {
        const agentKind = agentKindRegistry[agentKindComponent.kind]
        agentKind.tick(entityId, components, this.roomContext)
      }
    }
  }

  dispose() {
    this.unsubscribeFromEvents()
  }
}
