import { Injectable } from '@nestjs/common'
import { S3UrlService } from '../../common/services/s3-url.service'
import { GroupsService } from '../groups/groups.service'
import { PlayerGroupResponseDto } from './dto/player-group-response.dto'
import { PlayerHasGroupRepository, PlayerRawRow } from './repositories/player-has-group.repository'

@Injectable()
export class PlayerHasGroupService {
  constructor(
    private readonly playerHasGroupRepository: PlayerHasGroupRepository,
    private readonly groupsService: GroupsService,
    private readonly s3UrlService: S3UrlService,
  ) {}

  async isPlayerInGroup(playerId: string, groupId: string): Promise<boolean> {
    return this.playerHasGroupRepository.existsByPlayerAndGroup(playerId, groupId)
  }

  async countByGroupId(groupId: string): Promise<number> {
    return await this.playerHasGroupRepository.countByGroupId(groupId)
  }

  async createMembership(playerId: string, groupId: string): Promise<void> {
    const membership = this.playerHasGroupRepository.create({ playerId, groupId })
    await this.playerHasGroupRepository.save(membership)
  }

  async findPlayersByGroupCode(groupCode: string): Promise<PlayerGroupResponseDto[]> {
    const group = await this.groupsService.findByCode(groupCode)
    const rows: PlayerRawRow[] = await this.playerHasGroupRepository.findPlayersByGroupId(group.id)
    return rows.map((row) => PlayerGroupResponseDto.from(row, this.s3UrlService))
  }
}
