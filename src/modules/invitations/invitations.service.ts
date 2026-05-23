import { Injectable } from '@nestjs/common'
import { InvitationStatus } from './entities/invitation.entity'
import { InvitationRepository } from './repositories/invitation.repository'

@Injectable()
export class InvitationsService {
  constructor(private readonly invitationRepository: InvitationRepository) {}

  async createPending(groupId: string, phoneNumber: string, invitedById: string): Promise<void> {
    const invitation = this.invitationRepository.create({
      groupId,
      phoneNumber,
      invitedById,
      status: InvitationStatus.Pending,
      expiresAt: null,
    })
    await this.invitationRepository.save(invitation)
  }
}
