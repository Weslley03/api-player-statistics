import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { IndividualAward } from './entities/individual-award.entity'
import { IndividualAwardRepository } from './repositories/individual-award.repository'

@Module({
  imports: [TypeOrmModule.forFeature([IndividualAward])],
  providers: [IndividualAwardRepository],
  exports: [IndividualAwardRepository],
})
export class IndividualAwardsModule {}
