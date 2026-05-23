import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'
import { Group } from '../groups/entities/group.entity'
import { Permission } from '../permissions/entities/permission.entity'
import { PlayerHasGroup } from '../player-has-group/entities/player-has-group.entity'
import { Player } from '../players/entities/player.entity'
import { Role } from '../roles/entities/role.entity'
import { LoginDto } from './dto/login.dto'
import { SelectGroupDto } from './dto/select-group.dto'
import { AuthTokens, GroupContext, LoginResult } from './interfaces/auth.interfaces'
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

    const payload: JwtPayload = {
      sub: player.id,
      phone: player.phoneNumber ?? '',
      groupId: dto.groupId,
      isManager,
    }

    return { accessToken: this.jwtService.sign(payload) }
  }
}
