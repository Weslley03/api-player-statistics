import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import type { StringValue } from 'ms'
import { Group } from '../groups/entities/group.entity'
import { Permission } from '../permissions/entities/permission.entity'
import { PlayerHasGroup } from '../player-has-group/entities/player-has-group.entity'
import { Player } from '../players/entities/player.entity'
import { Role } from '../roles/entities/role.entity'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') as StringValue,
        },
      }),
    }),
    TypeOrmModule.forFeature([Player, Group, PlayerHasGroup, Permission, Role]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
