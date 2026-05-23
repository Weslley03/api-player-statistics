import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Invitation } from './entities/invitation.entity'
import { InvitationRepository } from './repositories/invitation.repository'
import { InvitationsService } from './invitations.service'

@Module({
  imports: [TypeOrmModule.forFeature([Invitation])],
  providers: [InvitationsService, InvitationRepository],
  exports: [InvitationsService],
})
export class InvitationsModule {}
