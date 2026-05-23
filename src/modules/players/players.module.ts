import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { GroupsModule } from '../groups/groups.module'
import { InvitationsModule } from '../invitations/invitations.module'
import { PermissionsModule } from '../permissions/permissions.module'
import { PlayerHasGroupModule } from '../player-has-group/player-has-group.module'
import { SubscriptionsModule } from '../subscriptions/subscriptions.module'
import { Player } from './entities/player.entity'
import { PlayersController } from './players.controller'
import { PlayersService } from './players.service'
import { PlayerRepository } from './repositories/player.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Player]), AuthModule, GroupsModule, InvitationsModule, PermissionsModule, PlayerHasGroupModule, SubscriptionsModule],
  controllers: [PlayersController],
  providers: [PlayersService, PlayerRepository],
})
export class PlayersModule {}
