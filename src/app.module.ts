import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envValidationSchema } from './config/env.validation'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './modules/auth/auth.module'
import { GroupsModule } from './modules/groups/groups.module'
import { InvitationsModule } from './modules/invitations/invitations.module'
import { MatchesModule } from './modules/matches/matches.module'
import { PermissionsModule } from './modules/permissions/permissions.module'
import { PlansModule } from './modules/plans/plans.module'
import { PlayerHasGroupModule } from './modules/player-has-group/player-has-group.module'
import { PlayersModule } from './modules/players/players.module'
import { SeasonsModule } from './modules/seasons/seasons.module'
import { SharedModule } from './shared/shared.module'
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      envFilePath: '.env',
    }),
    SharedModule,
    DatabaseModule,
    AuthModule,
    GroupsModule,
    InvitationsModule,
    MatchesModule,
    PermissionsModule,
    PlansModule,
    PlayerHasGroupModule,
    PlayersModule,
    SeasonsModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
