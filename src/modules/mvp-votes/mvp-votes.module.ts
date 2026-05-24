import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { IndividualAwardsModule } from '../individual-awards/individual-awards.module'
import { MvpVote } from './entities/mvp-vote.entity'
import { MvpVotesController } from './mvp-votes.controller'
import { MvpVotesService } from './mvp-votes.service'
import { MvpVoteRepository } from './repositories/mvp-vote.repository'

@Module({
  imports: [TypeOrmModule.forFeature([MvpVote]), AuthModule, IndividualAwardsModule],
  controllers: [MvpVotesController],
  providers: [MvpVotesService, MvpVoteRepository],
})
export class MvpVotesModule {}
