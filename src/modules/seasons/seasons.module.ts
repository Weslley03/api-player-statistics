import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Season } from './entities/season.entity'
import { SeasonRepository } from './repositories/season.repository'
import { SeasonsService } from './seasons.service'

@Module({
  imports: [TypeOrmModule.forFeature([Season])],
  providers: [SeasonsService, SeasonRepository],
  exports: [SeasonsService],
})
export class SeasonsModule {}
