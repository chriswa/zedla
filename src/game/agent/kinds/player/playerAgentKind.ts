import { CanvasLog } from '@/dev/canvasLog'
import { BaseAgentKind } from '@/game/agent/baseAgentKind'
import { PlayerAnimationBehavior } from '@/game/agent/kinds/player/behaviors/playerAnimationBehavior'
import { PlayerMovementBehavior } from '@/game/agent/kinds/player/behaviors/playerMovementBehavior'
import { classMap as playerStrategyFsmClassMap } from '@/game/agent/kinds/player/fsm/_classMap'
import { FacingComponent, HitboxComponent, HurtboxComponent, InvulnerabilityComponent, PhysicsBodyComponent } from '@/game/ecs/components'
import { ECS, EntityComponentMap, EntityId } from '@/game/ecs/ecs'
import { RoomContext } from '@/game/roomContext'
import { rect } from '@/math/rect'
import { vec2 } from '@/math/vec2'
import { CombatBit, createCombatMask } from '@/types/combat'
import { Facing } from '@/types/facing'
import { singleton } from 'tsyringe'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PlayerSpawnData {}

@singleton()
export class PlayerAgentKind extends BaseAgentKind<PlayerSpawnData, typeof playerStrategyFsmClassMap> {
  constructor(
    ecs: ECS,
    playerMovementBehavior: PlayerMovementBehavior,
    private playerAnimationBehavior: PlayerAnimationBehavior,
    private canvasLog: CanvasLog,
  ) {
    super(ecs, playerStrategyFsmClassMap, 'GroundedStrategy', [playerMovementBehavior])
  }

  protected addComponents(entityId: EntityId, _spawnData: PlayerSpawnData): void {
    this.playerAnimationBehavior.addSpriteAndAnimationComponents(this.ecs, entityId, 'stand', 1)
    this.ecs.addComponent(entityId, 'FacingComponent', new FacingComponent(Facing.RIGHT))
    this.ecs.addComponent(entityId, 'PhysicsBodyComponent', new PhysicsBodyComponent(rect.createFromCorners(-6, -30, 6, 0), vec2.zero()))
    this.ecs.addComponent(entityId, 'HitboxComponent', new HitboxComponent(rect.createFromCorners(-6, -30, 6, 0), createCombatMask(CombatBit.EnemyWeaponHurtingPlayer)))
    this.ecs.addComponent(entityId, 'HurtboxComponent', new HurtboxComponent(rect.zero(), createCombatMask(CombatBit.PlayerWeaponHurtingEnemy), false))
    this.ecs.addComponent(entityId, 'InvulnerabilityComponent', new InvulnerabilityComponent())
  }

  protected afterTick(entityId: EntityId, _components: EntityComponentMap, _room: RoomContext): void {
    const physics = this.ecs.getComponent(entityId, 'PhysicsBodyComponent')
    this.canvasLog.upsertPermanent('player-velocity', `player velocity: ${(physics.velocity[0] ?? 0).toFixed(3)}, ${(physics.velocity[1] ?? 0).toFixed(3)}`, 0)
  }
}
