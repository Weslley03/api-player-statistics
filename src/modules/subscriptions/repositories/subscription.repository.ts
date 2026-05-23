import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity'

@Injectable()
export class SubscriptionRepository extends Repository<Subscription> {
  constructor(private readonly dataSource: DataSource) {
    super(Subscription, dataSource.createEntityManager())
  }

  async findActiveWithPlanByGroupId(groupId: string): Promise<Subscription | null> {
    return this.findOne({
      where: { groupId, status: SubscriptionStatus.Active },
      relations: { plan: true },
    })
  }
}
