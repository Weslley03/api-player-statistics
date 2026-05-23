import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GroupsModule } from '../groups/groups.module'
import { PlayerHasGroup } from './entities/player-has-group.entity'
import { PlayerHasGroupController } from './player-has-group.controller'
import { PlayerHasGroupService } from './player-has-group.service'
import { PlayerHasGroupRepository } from './repositories/player-has-group.repository'

@Module({
  imports: [TypeOrmModule.forFeature([PlayerHasGroup]), GroupsModule],
  controllers: [PlayerHasGroupController],
  providers: [PlayerHasGroupService, PlayerHasGroupRepository],
  exports: [PlayerHasGroupService],
})
export class PlayerHasGroupModule {}
