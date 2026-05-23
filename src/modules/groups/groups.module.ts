import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Group } from './entities/group.entity'
import { GroupRepository } from './repositories/group.repository'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  controllers: [GroupsController],
  providers: [GroupsService, GroupRepository],
  exports: [GroupsService],
})
export class GroupsModule {}
