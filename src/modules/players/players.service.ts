import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { S3StorageService } from '../../common/services/s3-storage.service'
import { S3UrlService } from '../../common/services/s3-url.service'
import { WhatsAppService } from '../../shared/services/whatsapp.service'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { GroupsService } from '../groups/groups.service'
import { InvitationsService } from '../invitations/invitations.service'
import { PermissionsService } from '../permissions/permissions.service'
import { PlayerHasGroupService } from '../player-has-group/player-has-group.service'
import { SubscriptionsService } from '../subscriptions/subscriptions.service'
import { CreatePlayerDto } from './dto/create-player.dto'
import { UpdatePlayerDto } from './dto/update-player.dto'
import { ClubItemDto, IndividualAwardDto, MatchParticipationDto, PlayerResponseDto } from './dto/player-response.dto'
import { Player } from './entities/player.entity'
import { PlayerStatsRawRow } from './interfaces/player-stats-raw-row.interface'
import { PlayerRepository } from './repositories/player.repository'

@Injectable()
export class PlayersService {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly s3UrlService: S3UrlService,
    private readonly s3StorageService: S3StorageService,
    private readonly groupsService: GroupsService,
    private readonly invitationsService: InvitationsService,
    private readonly permissionsService: PermissionsService,
    private readonly playerHasGroupService: PlayerHasGroupService,
    private readonly whatsAppService: WhatsAppService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async create(dto: CreatePlayerDto, managerPlayerId: string, groupId: string): Promise<Player> {
    const [subscription, currentCount] = await Promise.all([this.subscriptionsService.findActiveWithPlanByGroupId(groupId), this.playerHasGroupService.countByGroupId(groupId)])
    if (currentCount >= subscription.plan.playerLimit) {
      throw new ForbiddenException(`Player limit of ${subscription.plan.playerLimit} reached for this group`)
    }

    const e164Phone = dto.phoneNumber ? `+55${dto.phoneNumber}` : null

    if (e164Phone) {
      const existingPlayer = await this.playerRepository.findOne({ where: { phoneNumber: e164Phone } })

      if (existingPlayer) {
        const [manager, group] = await Promise.all([this.playerRepository.findOne({ where: { id: managerPlayerId } }), this.groupsService.findById(groupId)])

        try {
          await Promise.all([this.playerHasGroupService.createMembership(existingPlayer.id, groupId), this.permissionsService.grantRole(existingPlayer.id, groupId, 'user')])
        } catch (err: unknown) {
          const pg = err as { code?: string }
          if (pg.code === '23505') throw new ConflictException('Player is already a member of this group')
          throw err
        }

        await this.invitationsService.createPending(groupId, e164Phone, managerPlayerId)
        await this.whatsAppService.sendGroupAddedNotification({
          to: e164Phone,
          playerName: existingPlayer.name,
          managerName: manager?.name ?? 'Manager',
          groupName: group.description,
          groupCode: group.code,
        })

        return existingPlayer
      }
    }

    const rawPassword = String(Math.floor(1000 + Math.random() * 9000))
    const hashedPassword = e164Phone ? await bcrypt.hash(rawPassword, 10) : null

    try {
      const player = this.playerRepository.create({ name: dto.name, phoneNumber: e164Phone, password: hashedPassword })
      const saved: Player = await this.playerRepository.save(player)

      await Promise.all([this.playerHasGroupService.createMembership(saved.id, groupId), this.permissionsService.grantRole(saved.id, groupId, 'user')])

      if (e164Phone) {
        const [manager, group] = await Promise.all([this.playerRepository.findOne({ where: { id: managerPlayerId } }), this.groupsService.findById(groupId)])

        await this.invitationsService.createPending(groupId, e164Phone, managerPlayerId)
        await this.whatsAppService.sendInvitation({
          to: e164Phone,
          rawPassword,
          managerName: manager?.name ?? 'Manager',
          groupName: group.description,
          groupCode: group.code,
        })
      }

      return saved
    } catch (err: unknown) {
      const pg = err as { code?: string }
      if (pg.code === '23505') throw new ConflictException('Player with this phone number already exists')
      throw err
    }
  }

  async findById(playerId: string, groupCode: string): Promise<PlayerResponseDto> {
    const group = await this.groupsService.findByCode(groupCode)
    const statsRow = await this.playerRepository.findWithStatsByPlayerAndGroup(playerId, group.id)
    if (statsRow === undefined) throw new NotFoundException(`Player with id ${playerId} not found in group "${groupCode}"`)
    return this.buildResponse(statsRow)
  }

  async update(targetPlayerId: string, dto: UpdatePlayerDto, avatar: { buffer: Buffer; mimetype: string } | undefined, caller: JwtPayload): Promise<Player> {
    if (caller.isManager) {
      const isMember = await this.playerHasGroupService.isPlayerInGroup(targetPlayerId, caller.groupId)
      if (!isMember) throw new ForbiddenException('Player is not in your group')
    } else {
      if (targetPlayerId !== caller.sub) throw new ForbiddenException('You can only update your own profile')
      if (dto.phoneNumber !== undefined) throw new ForbiddenException('You cannot change your phone number')
    }

    const player = await this.playerRepository.findOne({ where: { id: targetPlayerId } })
    if (!player) throw new NotFoundException(`Player ${targetPlayerId} not found`)

    if (dto.name !== undefined) player.name = dto.name
    if (dto.position !== undefined) player.position = dto.position
    if (dto.club !== undefined) player.club = dto.club
    if (dto.phoneNumber !== undefined) {
      player.phoneNumber = dto.phoneNumber ? `+55${dto.phoneNumber}` : null
    }

    if (avatar) {
      await this.s3StorageService.uploadAvatar(targetPlayerId, avatar.buffer, avatar.mimetype)
      player.avatarUrl = this.s3UrlService.buildAvatarUrl(targetPlayerId, targetPlayerId)
    }

    return this.playerRepository.save(player)
  }

  async listClubs(): Promise<ClubItemDto[]> {
    const keys = await this.s3StorageService.listClubKeys()
    return keys.map((key) => ClubItemDto.from(key, this.s3UrlService.buildClubUrl(key)!))
  }

  /** build PlayerResponseDto. */
  private async buildResponse(row: PlayerStatsRawRow): Promise<PlayerResponseDto> {
    const [matchRows, awardRows] = await Promise.all([
      this.playerRepository.findMatchParticipationsByPlayerAndGroup(row.id, row.groupId),
      this.playerRepository.findAwardsByPlayerAndGroup(row.id, row.groupId),
    ])

    const matchIds = matchRows.map((m) => Number(m.matchId))
    const mvpMatchIds = await this.playerRepository.findMvpMatchIds(row.id, matchIds)

    return PlayerResponseDto.from(
      row,
      awardRows.map((a) => IndividualAwardDto.from(a)),
      matchRows.map((m) => MatchParticipationDto.from(m, mvpMatchIds.has(Number(m.matchId)))),
      this.s3UrlService,
    )
  }
}
