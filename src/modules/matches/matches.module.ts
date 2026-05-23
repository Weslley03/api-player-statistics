import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscriptionsModule } from '../subscriptions/subscriptions.module'
import { Match } from './entities/match.entity'
import { MatchesController } from './matches.controller'
import { MatchesService } from './matches.service'
import { MatchRepository } from './repositories/match.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Match]), SubscriptionsModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchRepository],
})
export class MatchesModule {}
