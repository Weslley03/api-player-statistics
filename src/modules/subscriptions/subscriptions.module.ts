import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Subscription } from './entities/subscription.entity'
import { SubscriptionRepository } from './repositories/subscription.repository'
import { SubscriptionsService } from './subscriptions.service'

@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  providers: [SubscriptionsService, SubscriptionRepository],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
