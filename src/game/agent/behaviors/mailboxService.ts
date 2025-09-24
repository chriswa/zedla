import { ECS, EntityId } from '@/game/ecs/ecs'
import { singleton } from 'tsyringe'

@singleton()
export class MailboxService {
  constructor(private ecs: ECS) {}

  getMessagesOfType<T>(entityId: EntityId, messageType: string): Array<T> {
    const mailbox = this.ecs.getComponent(entityId, 'MailboxComponent')
    return mailbox.eventQueue.filter((msg) => msg.type === messageType) as Array<T>
  }

  clearMailbox(entityId: EntityId): void {
    const mailbox = this.ecs.getComponent(entityId, 'MailboxComponent')
    mailbox.eventQueue.length = 0
  }
}
