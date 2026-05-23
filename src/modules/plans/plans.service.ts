import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { WhatsAppService } from '../../shared/services/whatsapp.service'
import { GroupsService } from '../groups/groups.service'
import { Group } from '../groups/entities/group.entity'
import { PermissionsService } from '../permissions/permissions.service'
import { PlayerHasGroupService } from '../player-has-group/player-has-group.service'
import { Player } from '../players/entities/player.entity'
import { PlayerRepository } from '../players/repositories/player.repository'
import { Season } from '../seasons/entities/season.entity'
import { SeasonsService } from '../seasons/seasons.service'
import { Subscription } from '../subscriptions/entities/subscription.entity'
import { SubscriptionsService } from '../subscriptions/subscriptions.service'
import { SellPlanDto } from './dto/sell-plan.dto'
import { PlanRepository } from './repositories/plan.repository'

export interface SellPlanResult {
  player: Player
  group: Group
  season: Season
  subscription: Subscription
}

@Injectable()
export class PlansService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly groupsService: GroupsService,
    private readonly permissionsService: PermissionsService,
    private readonly playerHasGroupService: PlayerHasGroupService,
    private readonly seasonsService: SeasonsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  async sell(dto: SellPlanDto): Promise<SellPlanResult> {
    const plan = await this.planRepository.findById(dto.planId)
    if (!plan) throw new NotFoundException(`Plan ${dto.planId} not found`)
    if (!plan.isActive) throw new NotFoundException(`Plan ${dto.planId} is not active`)

    const e164Phone = `+55${dto.playerPhoneNumber}`

    const existingPlayer = await this.playerRepository.findOne({ where: { phoneNumber: e164Phone } })

    let player: Player
    let rawPassword: string | null = null
    let isNewPlayer = false

    if (existingPlayer) {
      player = existingPlayer
    } else {
      rawPassword = String(Math.floor(1000 + Math.random() * 9000))
      const hashedPassword = await bcrypt.hash(rawPassword, 10)

      try {
        player = await this.playerRepository.save(this.playerRepository.create({ name: dto.playerName, phoneNumber: e164Phone, password: hashedPassword }))
        isNewPlayer = true
      } catch (err: unknown) {
        const pg = err as { code?: string }
        if (pg.code === '23505') throw new ConflictException('Player with this phone number already exists')
        throw err
      }
    }

    let group: Group
    let season: Season | null = null
    let subscription: Subscription | null = null

    try {
      group = await this.groupsService.create({ code: dto.groupCode, description: dto.groupDescription })
    } catch (err: unknown) {
      const pg = err as { code?: string }
      if (pg.code === '23505') throw new ConflictException(`Group with code "${dto.groupCode}" already exists`)
      throw err
    }

    await Promise.all([this.playerHasGroupService.createMembership(player.id, group.id), this.permissionsService.grantRole(player.id, group.id, 'manager')])
    ;[season, subscription] = await Promise.all([this.seasonsService.createInitial(group.id), this.subscriptionsService.createActive(group.id, dto.planId)])

    if (isNewPlayer && rawPassword) {
      await this.whatsAppService.sendManagerWelcome({
        to: e164Phone,
        rawPassword,
        managerName: player.name,
        groupName: dto.groupDescription,
        groupCode: dto.groupCode,
      })
    } else {
      await this.whatsAppService.sendManagerNewGroupNotification({
        to: e164Phone,
        managerName: player.name,
        groupName: dto.groupDescription,
        groupCode: dto.groupCode,
      })
    }

    return { player, group, season, subscription }
  }
}
