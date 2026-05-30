import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { createHash, randomUUID } from 'crypto'
import { Repository } from 'typeorm'
import { Group } from '../groups/entities/group.entity'
import { Permission } from '../permissions/entities/permission.entity'
import { PlayerHasGroup } from '../player-has-group/entities/player-has-group.entity'
import { Player } from '../players/entities/player.entity'
import { Role } from '../roles/entities/role.entity'
import { LoginDto } from './dto/login.dto'
import { LogoutDto } from './dto/logout.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { SelectGroupDto } from './dto/select-group.dto'
import { AuthTokens, GroupContext, LoginResult, RefreshTokenPayload } from './interfaces/auth.interfaces'
import { JwtPayload } from './interfaces/jwt-payload.interface'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(PlayerHasGroup)
    private readonly playerHasGroupRepository: Repository<PlayerHasGroup>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const e164Phone = `+55${dto.phoneNumber}`

    const player = await this.playerRepository.findOne({ where: { phoneNumber: e164Phone } })
    if (!player) throw new UnauthorizedException('Invalid credentials')

    const passwordMatches = await bcrypt.compare(dto.password, player.password ?? '')
    if (!passwordMatches) throw new UnauthorizedException('Invalid credentials')

    const memberships = await this.playerHasGroupRepository.find({ where: { playerId: player.id } })

    const groups: GroupContext[] = await Promise.all(
      memberships.map(async (m) => {
        const group = await this.groupRepository.findOne({ where: { id: m.groupId } })
        if (!group) return null

        const permission = await this.permissionRepository.findOne({ where: { playerId: player.id, groupId: m.groupId } })
        let role = 'user'
        let isManager = false

        if (permission) {
          role = permission.role
          const roleEntity = await this.roleRepository.findOne({ where: { role: permission.role } })
          isManager = roleEntity?.isManager ?? false
        }

        return { id: group.id, code: group.code, description: group.description, role, isManager }
      }),
    ).then((results) => results.filter((g): g is GroupContext => g !== null))

    return {
      player: {
        id: player.id,
        name: player.name,
        phoneNumber: player.phoneNumber ?? '',
        position: player.position ?? null,
        avatarUrl: player.avatarUrl ?? null,
        club: player.club ?? null,
      },
      groups,
    }
  }

  async selectGroup(dto: SelectGroupDto): Promise<AuthTokens> {
    const e164Phone = `+55${dto.phoneNumber}`

    const player = await this.playerRepository.findOne({ where: { phoneNumber: e164Phone } })
    if (!player) throw new UnauthorizedException('Invalid credentials')

    const passwordMatches = await bcrypt.compare(dto.password, player.password ?? '')
    if (!passwordMatches) throw new UnauthorizedException('Invalid credentials')

    const membership = await this.playerHasGroupRepository.findOne({ where: { playerId: player.id, groupId: dto.groupId } })
    if (!membership) throw new UnauthorizedException('You are not a member of this group')

    const permission = await this.permissionRepository.findOne({ where: { playerId: player.id, groupId: dto.groupId } })

    let isManager = false
    if (permission) {
      const role = await this.roleRepository.findOne({ where: { role: permission.role } })
      isManager = role?.isManager ?? false
    }

    return this.issueTokenPair(player, membership, isManager)
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthTokens> {
    let payload: RefreshTokenPayload
    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(dto.refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      })
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid token type')

    const membership = await this.playerHasGroupRepository.findOne({
      where: { playerId: payload.sub, groupId: payload.groupId },
    })

    if (!membership || membership.refreshTokenJti !== payload.jti) {
      if (membership) {
        await this.playerHasGroupRepository.update(membership.id, {
          refreshTokenHash: null,
          refreshTokenJti: null,
          refreshTokenExpiresAt: null,
        })
      }
      throw new UnauthorizedException('Refresh token reused or revoked')
    }

    const incomingHash = createHash('sha256').update(dto.refreshToken).digest('hex')
    if (membership.refreshTokenHash !== incomingHash) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const player = await this.playerRepository.findOne({ where: { id: payload.sub } })
    if (!player) throw new UnauthorizedException('Player not found')

    const permission = await this.permissionRepository.findOne({
      where: { playerId: player.id, groupId: payload.groupId },
    })
    let isManager = false
    if (permission) {
      const role = await this.roleRepository.findOne({ where: { role: permission.role } })
      isManager = role?.isManager ?? false
    }

    return this.issueTokenPair(player, membership, isManager)
  }

  async logout(dto: LogoutDto): Promise<void> {
    let payload: RefreshTokenPayload
    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(dto.refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      })
    } catch {
      return
    }

    const membership = await this.playerHasGroupRepository.findOne({
      where: { playerId: payload.sub, groupId: payload.groupId },
    })

    if (!membership || membership.refreshTokenJti !== payload.jti) return

    await this.playerHasGroupRepository.update(membership.id, {
      refreshTokenHash: null,
      refreshTokenJti: null,
      refreshTokenExpiresAt: null,
    })
  }

  private async issueTokenPair(player: Player, membership: PlayerHasGroup, isManager: boolean): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: player.id,
      phone: player.phoneNumber ?? '',
      groupId: membership.groupId,
      isManager,
    }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    })

    const jti = randomUUID()
    const expiresInDays = 30

    const refreshToken = this.jwtService.sign({ sub: player.id, groupId: membership.groupId, jti, type: 'refresh' } satisfies RefreshTokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    })

    const hash = createHash('sha256').update(refreshToken).digest('hex')
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

    await this.playerHasGroupRepository.update(membership.id, {
      refreshTokenHash: hash,
      refreshTokenJti: jti,
      refreshTokenExpiresAt: expiresAt,
    })

    return { accessToken, refreshToken }
  }
}
