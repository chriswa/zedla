import { singleton } from 'tsyringe'

import type { IAgentKind } from '../agentKind'
import { ECS } from '../../ecs/ecs'
import type { EntityId, EntityComponentMap } from '../../ecs/ecs'
import type { RoomContext } from '../../roomContext'
import { Input, Button } from '@/app/input'
import { Facing } from '@/types/facing'
import { PhysicsBodyComponent, HitboxComponent, FacingComponent } from '@/game/ecs/components'
import { rect } from '@/math/rect'
import { vec2 } from '@/math/vec2'
import { createCombatMask, CombatBit } from '@/types/combat'
import { AnimationController } from '../animationController'
import { GRAVITY } from '@/game/ecs/systems/physicsSystem'

const PLAYER_SPEED = 120

interface PlayerSpawnData {
}

@singleton()
export class PlayerAgentKind implements IAgentKind<PlayerSpawnData> {
  constructor(
    private ecs: ECS,
    private input: Input,
  ) {}
  private animationController = new AnimationController('link')

  spawn(entityId: EntityId, _spawnData: PlayerSpawnData): void {
    this.animationController.addSpriteAndAnimationComponents(this.ecs, entityId, 'stand')
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
    this.ecs.addComponent(entityId, 'PhysicsBodyComponent', new PhysicsBodyComponent(rect.createFromCorners(-6, -30, 6, 0), vec2.zero()))
    this.ecs.addComponent(entityId, 'HitboxComponent', new HitboxComponent(rect.createFromCorners(-6, -30, 6, 0), createCombatMask(CombatBit.EnemyWeaponHurtingPlayer)))
  }

  tick(entityId: EntityId, components: EntityComponentMap, _room: RoomContext): void {
    const body = components.PhysicsBodyComponent
    if (!body) return

    body.velocity[1]! += GRAVITY / 60

    // Horizontal control
    body.velocity[0] = 0
    const left = this.input.isDown(Button.LEFT)
    const right = this.input.isDown(Button.RIGHT)
    if (left && !right) body.velocity[0] = -PLAYER_SPEED
    else if (right && !left) body.velocity[0] = PLAYER_SPEED

    // Face movement direction
    const facing = this.ecs.getComponent(entityId, 'FacingComponent')
    if (facing) {
      if (body.velocity[0]! > 0) facing.value = Facing.RIGHT
      else if (body.velocity[0]! < 0) facing.value = Facing.LEFT
    }

    // Process and clear mailbox (if present)
    const mailbox = components.MailboxComponent
    if (mailbox) mailbox.eventQueue.length = 0
  }

  onDestroy(_entityId: EntityId): void {}
}
