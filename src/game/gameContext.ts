import { roomDefs } from '@/resources/roomDefs'

export interface GameContext {
  currentTick: number
  currentRoomDefKey: keyof typeof roomDefs | undefined
}
