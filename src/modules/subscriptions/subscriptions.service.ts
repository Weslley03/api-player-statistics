import { Injectable, NotFoundException } from '@nestjs/common'
import { Subscription, SubscriptionStatus } from './entities/subscription.entity'
import { SubscriptionRepository } from './repositories/subscription.repository'

@Injectable()
export class SubscriptionsService {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async createActive(groupId: string, planId: number): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      groupId,
      planId,
      status: SubscriptionStatus.Active,
      startsAt: new Date(),
      expiresAt: null,
    })
    return this.subscriptionRepository.save(subscription)
  }

  async findActiveWithPlanByGroupId(groupId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findActiveWithPlanByGroupId(groupId)
    if (!subscription) throw new NotFoundException(`No active subscription found for group ${groupId}`)
    return subscription
  }
}
