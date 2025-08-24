import type { Animation } from "@/types/Axnimation"

// export const animations: Record<string, Record<string, Animation>> = {
export const animations = {

  "blob": {
    "twitch": {
      loop: true,
      frames: [
        {
          frame: "blob_twitch_0",
          duration: 4,
        },
        {
          frame: "blob_twitch_1",
          duration: 2,
        }
      ]
    },
    "inch": {
      loop: true,
      frames: [
        {
          frame: "blob_idle",
          duration: 4,
        },
        {
          frame: "blob_twitch_0",
          duration: 14,
        }
      ]
    },
    "jump": {
      loop: true,
      frames: [
        {
          frame: "blob_idle",
          duration: 1,
        }
      ]
    }
  },
  "boomeranger": {
    "attack-high": {
      loop: true,
      frames: [
        {
          frame: "boomeranger_attack_high_0",
          duration: 30,
        },
        {
          frame: "boomeranger_walk_1",
          duration: 999,
        }
      ]
    },
    "attack-low": {
      loop: true,
      frames: [
        {
          frame: "boomeranger_attack_low_0",
          duration: 30,
        },
        {
          frame: "boomeranger_attack_low_1",
          duration: 999,
        }
      ]
    },
    "walk": {
      loop: true,
      frames: [
        {
          frame: "boomeranger_walk_0",
          duration: 10,
        },
        {
          frame: "boomeranger_walk_1",
          duration: 10,
        }
      ]
    }
  },
  "bubble": {
    "default": {
      loop: true,
      frames: [
        {
          frame: "bubble_default_0",
          duration: 10,
        }
      ]
    }
  },
  "deeler": {
    "attack": {
      loop: true,
      frames: [
        {
          frame: "deeler_attack_0",
          duration: 6,
        },
        {
          frame: "deeler_attack_1",
          duration: 6,
        }
      ]
    },
    "canopy": {
      loop: true,
      frames: [
        {
          frame: "deeler_canopy_0",
          duration: 6,
        },
        {
          frame: "deeler_canopy_1",
          duration: 6,
        }
      ]
    }
  },
  "explosion": {
    "default": {
      loop: true,
      frames: [
        {
          frame: "explosion_default_0",
          duration: 5,
        },
        {
          frame: "explosion_default_1",
          duration: 5,
        },
        {
          frame: "explosion_default_2",
          duration: 5,
        },
        {
          frame: "explosion_default_3",
          duration: 5,
        },
        {
          frame: "explosion_default_0",
          duration: 5,
        },
        {
          frame: "explosion_default_1",
          duration: 5,
        }
      ]
    }
  },
  "fairy": {
    "default": {
      loop: true,
      frames: [
        {
          frame: "fairy_default_0",
          duration: 6,
        },
        {
          frame: "fairy_default_1",
          duration: 6,
        }
      ]
    }
  },
  "fireball": {
    "burn": {
      loop: true,
      frames: [
        {
          frame: "fireball_burn_0",
          duration: 4,
        },
        {
          frame: "fireball_burn_1",
          duration: 4,
        },
        {
          frame: "fireball_burn_2",
          duration: 2,
        }
      ]
    }
  },
  "hammer-thrower": {
    "default": {
      loop: true,
      frames: [
        {
          frame: "hammer_thrower_default_0",
          duration: 10,
        },
        {
          frame: "hammer_thrower_default_1",
          duration: 10,
        }
      ]
    },
    "throw": {
      loop: true,
      frames: [
        {
          frame: "hammer_thrower_throw_0",
          duration: 10,
        },
        {
          frame: "hammer_thrower_throw_1",
          duration: 10,
        }
      ]
    }
  },
  "heart-container": {
    "idle": {
      loop: true,
      frames: [
        {
          frame: "heart_container_idle_0",
          duration: 9999,
        }
      ]
    }
  },
  "key": {
    "idle": {
      loop: true,
      frames: [
        {
          frame: "key_idle_0",
          duration: 9999,
        }
      ]
    }
  },
  "lizardpuppy": {
    "idle": {
      loop: true,
      frames: [
        {
          frame: "lizardpuppy_idle_0",
          duration: 1,
        }
      ]
    },
    "walk": {
      loop: true,
      frames: [
        {
          frame: "lizardpuppy_walk_0",
          duration: 1,
        },
        {
          frame: "lizardpuppy_idle_0",
          duration: 1,
        }
      ]
    },
    "stand": {
      loop: true,
      frames: [
        {
          frame: "lizardpuppy_stand_0",
          duration: 1,
        }
      ]
    }
  },
  "octorok": {
    "idle": {
      loop: true,
      frames: [
        {
          frame: "octorok_idle_0",
          duration: 10,
        },
        {
          frame: "octorok_idle_1",
          duration: 10,
        }
      ]
    }
  },
  "proj-hammer": {
    "default": {
      loop: true,
      frames: [
        {
          frame: "proj_hammer_default_0",
          duration: 6,
        },
        {
          frame: "proj_hammer_default_1",
          duration: 6,
        },
        {
          frame: "proj_hammer_default_2",
          duration: 6,
        },
        {
          frame: "proj_hammer_default_3",
          duration: 6,
        }
      ]
    }
  },
  "scorpy": {
    "example": {
      loop: true,
      frames: [
        {
          frame: "scorpy_example_0",
          duration: 1,
        },
        {
          frame: "scorpy_example_1",
          duration: 1,
        },
        {
          frame: "scorpy_example_2",
          duration: 1,
        },
        {
          frame: "scorpy_example_3",
          duration: 1,
        },
        {
          frame: "scorpy_example_4",
          duration: 1,
        },
        {
          frame: "scorpy_example_5",
          duration: 1,
        },
        {
          frame: "scorpy_example_4",
          duration: 1,
        },
        {
          frame: "scorpy_example_3",
          duration: 1,
        }
      ]
    }
  },
  "skeleton": {
    "attack": {
      loop: true,
      frames: [
        {
          frame: "skeleton_attack_0",
          duration: 10,
        },
        {
          frame: "skeleton_attack_1",
          duration: 10,
        },
        {
          frame: "skeleton_attack_2",
          duration: 20,
        },
        {
          frame: "skeleton_walk_0",
          duration: 30,
        }
      ]
    },
    "jump": {
      loop: true,
      frames: [
        {
          frame: "skeleton_jump_0",
          duration: 10,
        }
      ]
    },
    "walk": {
      loop: true,
      frames: [
        {
          frame: "skeleton_walk_0",
          duration: 10,
        },
        {
          frame: "skeleton_walk_1",
          duration: 10,
        }
      ]
    }
  },
  "proj-boomerang": {
    "default": {
      loop: true,
      frames: [
        {
          frame: "proj_boomerang_default_0",
          duration: 6,
        },
        {
          frame: "proj_boomerang_default_1",
          duration: 6,
        }
      ]
    }
  },
  "elevator": {
    "default": {
      loop: true,
      frames: [
        {
          frame: "elevator_default_0",
          duration: 999,
        }
      ]
    }
  },
  "link": {
    "attack": {
      loop: false,
      frames: [
        {
          frame: "link_attack_0",
          duration: 5,
        },
        {
          frame: "link_attack_1",
          duration: 7,
        },
        {
          frame: "link_attack_0",
          duration: 30,
        },
        {
          frame: "link_stand_0",
          duration: 999,
        }
      ]
    },
    "collect": {
      loop: true,
      frames: [
        {
          frame: "link_collect_0",
          duration: 9999,
        }
      ]
    },
    "crouch": {
      loop: false,
      frames: [
        {
          frame: "link_crouch_0",
          duration: 9999,
        }
      ]
    },
    "crouch-attack": {
      loop: false,
      frames: [
        {
          frame: "link_crouch_attack_0",
          duration: 7,
        },
        {
          frame: "link_crouch_0",
          duration: 5,
        },
        {
          frame: "link_crouch_0",
          duration: 9999,
        }
      ]
    },
    "hurt": {
      loop: false,
      frames: [
        {
          frame: "link_hurt_0",
          duration: 9999,
        }
      ]
    },
    "jump": {
      loop: false,
      frames: [
        {
          frame: "link_crouch_0",
          duration: 16,
        },
        {
          frame: "link_stand_0",
          duration: 9999,
        }
      ]
    },
    "stand": {
      loop: true,
      frames: [
        {
          frame: "link_stand_0",
          duration: 9999,
        }
      ]
    },
    "walk": {
      loop: true,
      frames: [
        {
          frame: "link_walk_0",
          duration: 6,
        },
        {
          frame: "link_walk_1",
          duration: 6,
        },
        {
          frame: "link_walk_2",
          duration: 6,
        }
      ]
    }
  },
  "lock": {
    "default": {
      loop: true,
      frames: [
        {
          frame: "lock_default_0",
          duration: 999,
        }
      ]
    },
    "wall": {
      loop: true,
      frames: [
        {
          frame: "lock_wall_0",
          duration: 999,
        }
      ]
    }
  },
  "owblob": {
    "default": {
      loop: true,
      frames: [
        {
          frame: "owblob_default_0",
          duration: 6,
        },
        {
          frame: "owblob_default_1",
          duration: 6,
        }
      ]
    }
  },
  "owplayer": {
    "raft": {
      loop: true,
      frames: [
        {
          frame: "owplayer_raft_0",
          duration: 1,
        }
      ]
    },
    "stand": {
      loop: false,
      frames: [
        {
          frame: "owplayer_stand_0",
          duration: 9999,
        }
      ]
    },
    "walk-east": {
      loop: true,
      frames: [
        {
          frame: "owplayer_walk_east_0",
          duration: 6,
        },
        {
          frame: "owplayer_walk_east_1",
          duration: 6,
        }
      ]
    },
    "walk-north": {
      loop: true,
      frames: [
        {
          frame: "owplayer_walk_north_0",
          duration: 6,
        },
        {
          frame: "owplayer_walk_north_1",
          duration: 6,
        }
      ]
    },
    "walk-south": {
      loop: true,
      frames: [
        {
          frame: "owplayer_walk_south_0",
          duration: 6,
        },
        {
          frame: "owplayer_walk_south_1",
          duration: 6,
        }
      ]
    }
  },
  "owmonster": {
    "default": {
      loop: true,
      frames: [
        {
          frame: "owmonster_default_0",
          duration: 6,
        },
        {
          frame: "owmonster_default_1",
          duration: 6,
        }
      ]
    }
  },
  "owfairy": {
    "default": {
      loop: true,
      frames: [
        {
          frame: "owfairy_default_0",
          duration: 6,
        },
        {
          frame: "owfairy_default_1",
          duration: 6,
        }
      ]
    }
  }
} as const satisfies Record<string, Record<string, Animation>>
