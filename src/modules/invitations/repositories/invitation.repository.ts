import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Invitation } from '../entities/invitation.entity'

@Injectable()
export class InvitationRepository extends Repository<Invitation> {
  constructor(dataSource: DataSource) {
    super(Invitation, dataSource.createEntityManager())
  }
}
