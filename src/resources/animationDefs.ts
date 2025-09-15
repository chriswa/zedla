import { AnimationDef } from '@/types/animationDef'
import { AnimationFrameFlag, createAnimationFrameBits } from '@/types/animationFlags'

// export const animations: Record<string, Record<string, Animation>> = {
export const animationDefs = {

  'blob': {
    twitch: {
      loop: true,
      frames: [
        {
          spriteFrame: 'blob_twitch_0',
          duration: 4,
        },
        {
          spriteFrame: 'blob_twitch_1',
          duration: 2,
        },
      ],
    },
    inch: {
      loop: true,
      frames: [
        {
          spriteFrame: 'blob_idle',
          duration: 4,
        },
        {
          spriteFrame: 'blob_twitch_0',
          duration: 14,
        },
      ],
    },
    jump: {
      loop: true,
      frames: [
        {
          spriteFrame: 'blob_idle',
          duration: 1,
        },
      ],
    },
  },
  'boomeranger': {
    'attack-high': {
      loop: true,
      frames: [
        {
          spriteFrame: 'boomeranger_attack_high_0',
          duration: 30,
        },
        {
          spriteFrame: 'boomeranger_walk_1',
          duration: 999,
        },
      ],
    },
    'attack-low': {
      loop: true,
      frames: [
        {
          spriteFrame: 'boomeranger_attack_low_0',
          duration: 30,
        },
        {
          spriteFrame: 'boomeranger_attack_low_1',
          duration: 999,
        },
      ],
    },
    'walk': {
      loop: true,
      frames: [
        {
          spriteFrame: 'boomeranger_walk_0',
          duration: 10,
        },
        {
          spriteFrame: 'boomeranger_walk_1',
          duration: 10,
        },
      ],
    },
  },
  'bubble': {
    default: {
      loop: true,
      frames: [
        {
          spriteFrame: 'bubble_default_0',
          duration: 10,
        },
      ],
    },
  },
  'deeler': {
    attack: {
      loop: true,
      frames: [
        {
          spriteFrame: 'deeler_attack_0',
          duration: 6,
        },
        {
          spriteFrame: 'deeler_attack_1',
          duration: 6,
        },
      ],
    },
    canopy: {
      loop: true,
      frames: [
        {
          spriteFrame: 'deeler_canopy_0',
          duration: 6,
        },
        {
          spriteFrame: 'deeler_canopy_1',
          duration: 6,
        },
      ],
    },
  },
  'explosion': {
    default: {
      loop: true,
      frames: [
        {
          spriteFrame: 'explosion_default_0',
          duration: 5,
        },
        {
          spriteFrame: 'explosion_default_1',
          duration: 5,
        },
        {
          spriteFrame: 'explosion_default_2',
          duration: 5,
        },
        {
          spriteFrame: 'explosion_default_3',
          duration: 5,
        },
        {
          spriteFrame: 'explosion_default_0',
          duration: 5,
        },
        {
          spriteFrame: 'explosion_default_1',
          duration: 5,
        },
      ],
    },
  },
  'fairy': {
    default: {
      loop: true,
      frames: [
        {
          spriteFrame: 'fairy_default_0',
          duration: 6,
        },
        {
          spriteFrame: 'fairy_default_1',
          duration: 6,
        },
      ],
    },
  },
  'fireball': {
    burn: {
      loop: true,
      frames: [
        {
          spriteFrame: 'fireball_burn_0',
          duration: 4,
        },
        {
          spriteFrame: 'fireball_burn_1',
          duration: 4,
        },
        {
          spriteFrame: 'fireball_burn_2',
          duration: 2,
        },
      ],
    },
  },
  'hammer-thrower': {
    default: {
      loop: true,
      frames: [
        {
          spriteFrame: 'hammer_thrower_default_0',
          duration: 10,
        },
        {
          spriteFrame: 'hammer_thrower_default_1',
          duration: 10,
        },
      ],
    },
    throw: {
      loop: true,
      frames: [
        {
          spriteFrame: 'hammer_thrower_throw_0',
          duration: 10,
        },
        {
          spriteFrame: 'hammer_thrower_throw_1',
          duration: 10,
        },
      ],
    },
  },
  'heart-container': {
    idle: {
      loop: true,
      frames: [
        {
          spriteFrame: 'heart_container_idle_0',
          duration: 9999,
        },
      ],
    },
  },
  'key': {
    idle: {
      loop: true,
      frames: [
        {
          spriteFrame: 'key_idle_0',
          duration: 9999,
        },
      ],
    },
  },
  'lizardpuppy': {
    idle: {
      loop: true,
      frames: [
        {
          spriteFrame: 'lizardpuppy_idle_0',
          duration: 1,
        },
      ],
    },
    walk: {
      loop: true,
      frames: [
        {
          spriteFrame: 'lizardpuppy_walk_0',
          duration: 1,
        },
        {
          spriteFrame: 'lizardpuppy_idle_0',
          duration: 1,
        },
      ],
    },
    stand: {
      loop: true,
      frames: [
        {
          spriteFrame: 'lizardpuppy_stand_0',
          duration: 1,
        },
      ],
    },
  },
  'octorok': {
    idle: {
      loop: true,
      frames: [
        {
          spriteFrame: 'octorok_idle_0',
          duration: 10,
        },
        {
          spriteFrame: 'octorok_idle_1',
          duration: 10,
        },
      ],
    },
  },
  'proj-hammer': {
    default: {
      loop: true,
      frames: [
        {
          spriteFrame: 'proj_hammer_default_0',
          duration: 6,
        },
        {
          spriteFrame: 'proj_hammer_default_1',
          duration: 6,
        },
        {
          spriteFrame: 'proj_hammer_default_2',
          duration: 6,
        },
        {
          spriteFrame: 'proj_hammer_default_3',
          duration: 6,
        },
      ],
    },
  },
  'scorpy': {
    example: {
      loop: true,
      frames: [
        {
          spriteFrame: 'scorpy_example_0',
          duration: 1,
        },
        {
          spriteFrame: 'scorpy_example_1',
          duration: 1,
        },
        {
          spriteFrame: 'scorpy_example_2',
          duration: 1,
        },
        {
          spriteFrame: 'scorpy_example_3',
          duration: 1,
        },
        {
          spriteFrame: 'scorpy_example_4',
          duration: 1,
        },
        {
          spriteFrame: 'scorpy_example_5',
          duration: 1,
        },
        {
          spriteFrame: 'scorpy_example_4',
          duration: 1,
        },
        {
          spriteFrame: 'scorpy_example_3',
          duration: 1,
        },
      ],
    },
  },
  'skeleton': {
    attack: {
      loop: true,
      frames: [
        {
          spriteFrame: 'skeleton_attack_0',
          duration: 10,
        },
        {
          spriteFrame: 'skeleton_attack_1',
          duration: 10,
        },
        {
          spriteFrame: 'skeleton_attack_2',
          duration: 20,
        },
        {
          spriteFrame: 'skeleton_walk_0',
          duration: 30,
        },
      ],
    },
    jump: {
      loop: true,
      frames: [
        {
          spriteFrame: 'skeleton_jump_0',
          duration: 10,
        },
      ],
    },
    walk: {
      loop: true,
      frames: [
        {
          spriteFrame: 'skeleton_walk_0',
          duration: 10,
        },
        {
          spriteFrame: 'skeleton_walk_1',
          duration: 10,
        },
      ],
    },
  },
  'proj-boomerang': {
    default: {
      loop: true,
      frames: [
        {
          spriteFrame: 'proj_boomerang_default_0',
          duration: 6,
        },
        {
          spriteFrame: 'proj_boomerang_default_1',
          duration: 6,
        },
      ],
    },
  },
  'elevator': {
    default: {
      loop: true,
      frames: [
        {
          spriteFrame: 'elevator_default_0',
          duration: 999,
        },
      ],
    },
  },
  'link': {
    'attack': {
      loop: false,
      frames: [
        {
          spriteFrame: 'link_attack_0',
          duration: 5,
        },
        {
          spriteFrame: 'link_attack_1',
          duration: 7,
          flags: createAnimationFrameBits(AnimationFrameFlag.SwordSwing),
        },
        {
          spriteFrame: 'link_attack_0',
          duration: 30,
          flags: createAnimationFrameBits(AnimationFrameFlag.CanInterrupt),
        },
        {
          spriteFrame: 'link_stand_0',
          duration: 0,
          flags: createAnimationFrameBits(AnimationFrameFlag.CanInterrupt),
        },
      ],
    },
    'collect': {
      loop: false,
      frames: [
        {
          spriteFrame: 'link_collect_0',
          duration: 0,
        },
      ],
    },
    'crouch': {
      loop: false,
      frames: [
        {
          spriteFrame: 'link_crouch_0',
          duration: 0,
        },
      ],
    },
    'crouch-attack': {
      loop: false,
      frames: [
        {
          spriteFrame: 'link_crouch_attack_0',
          duration: 7,
          flags: createAnimationFrameBits(AnimationFrameFlag.SwordSwing),
        },
        {
          spriteFrame: 'link_crouch_0',
          duration: 5,
        },
        {
          spriteFrame: 'link_crouch_0',
          duration: 0,
          flags: createAnimationFrameBits(AnimationFrameFlag.CanInterrupt),
        },
      ],
    },
    'hurt': {
      loop: false,
      frames: [
        {
          spriteFrame: 'link_hurt_0',
          duration: 0,
        },
      ],
    },
    'jump': {
      loop: false,
      frames: [
        {
          spriteFrame: 'link_crouch_0',
          duration: 16,
        },
        {
          spriteFrame: 'link_stand_0',
          duration: 0,
        },
      ],
    },
    'stand': {
      loop: false,
      frames: [
        {
          spriteFrame: 'link_stand_0',
          duration: 0,
        },
      ],
    },
    'walk': {
      loop: true,
      frames: [
        {
          spriteFrame: 'link_walk_0',
          duration: 6,
        },
        {
          spriteFrame: 'link_walk_1',
          duration: 6,
        },
        {
          spriteFrame: 'link_walk_2',
          duration: 6,
        },
      ],
    },
  },
  'lock': {
    default: {
      loop: true,
      frames: [
        {
          spriteFrame: 'lock_default_0',
          duration: 999,
        },
      ],
    },
    wall: {
      loop: true,
      frames: [
        {
          spriteFrame: 'lock_wall_0',
          duration: 999,
        },
      ],
    },
  },
  'owblob': {
    default: {
      loop: true,
      frames: [
        {
          spriteFrame: 'owblob_default_0',
          duration: 6,
        },
        {
          spriteFrame: 'owblob_default_1',
          duration: 6,
        },
      ],
    },
  },
  'owplayer': {
    'raft': {
      loop: true,
      frames: [
        {
          spriteFrame: 'owplayer_raft_0',
          duration: 1,
        },
      ],
    },
    'stand': {
      loop: false,
      frames: [
        {
          spriteFrame: 'owplayer_stand_0',
          duration: 9999,
        },
      ],
    },
    'walk-east': {
      loop: true,
      frames: [
        {
          spriteFrame: 'owplayer_walk_east_0',
          duration: 6,
        },
        {
          spriteFrame: 'owplayer_walk_east_1',
          duration: 6,
        },
      ],
    },
    'walk-north': {
      loop: true,
      frames: [
        {
          spriteFrame: 'owplayer_walk_north_0',
          duration: 6,
        },
        {
          spriteFrame: 'owplayer_walk_north_1',
          duration: 6,
        },
      ],
    },
    'walk-south': {
      loop: true,
      frames: [
        {
          spriteFrame: 'owplayer_walk_south_0',
          duration: 6,
        },
        {
          spriteFrame: 'owplayer_walk_south_1',
          duration: 6,
        },
      ],
    },
  },
  'owmonster': {
    default: {
      loop: true,
      frames: [
        {
          spriteFrame: 'owmonster_default_0',
          duration: 6,
        },
        {
          spriteFrame: 'owmonster_default_1',
          duration: 6,
        },
      ],
    },
  },
  'owfairy': {
    default: {
      loop: true,
      frames: [
        {
          spriteFrame: 'owfairy_default_0',
          duration: 6,
        },
        {
          spriteFrame: 'owfairy_default_1',
          duration: 6,
        },
      ],
    },
  },
} as const satisfies Record<string, Record<string, AnimationDef>>
