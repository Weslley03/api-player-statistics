import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GroupsModule } from '../groups/groups.module'
import { PermissionsModule } from '../permissions/permissions.module'
import { PlayerHasGroupModule } from '../player-has-group/player-has-group.module'
import { Player } from '../players/entities/player.entity'
import { PlayerRepository } from '../players/repositories/player.repository'
import { SeasonsModule } from '../seasons/seasons.module'
import { SubscriptionsModule } from '../subscriptions/subscriptions.module'
import { Plan } from './entities/plan.entity'
import { PlansController } from './plans.controller'
import { PlansService } from './plans.service'
import { PlanRepository } from './repositories/plan.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Player]), GroupsModule, PermissionsModule, PlayerHasGroupModule, SeasonsModule, SubscriptionsModule],
  controllers: [PlansController],
  providers: [PlansService, PlanRepository, PlayerRepository],
})
export class PlansModule {}
