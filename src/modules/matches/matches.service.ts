import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { S3UrlService } from '../../common/services/s3-url.service'
import { SubscriptionsService } from '../subscriptions/subscriptions.service'
import { CreateMatchDto, TeamInputDto } from './dto/create-match.dto'
import { ListMatchesDto } from './dto/list-matches.dto'
import { MatchResponseDto, PaginatedMatchesDto } from './dto/match-response.dto'
import { Match } from './entities/match.entity'
import { ActiveSeasonNotFoundError, MatchRepository } from './repositories/match.repository'

@Injectable()
export class MatchesService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly s3UrlService: S3UrlService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async create(dto: CreateMatchDto): Promise<Match> {
    const [subscription, currentCount] = await Promise.all([
      this.subscriptionsService.findActiveWithPlanByGroupId(dto.groupId),
      this.matchRepository.countByGroupAndActiveSeason(dto.groupId),
    ])

    if (currentCount >= subscription.plan.matchLimit) {
      throw new ForbiddenException(`Match limit of ${subscription.plan.matchLimit} reached for this group's current season`)
    }

    this.validateNoOverlapBetweenTeams(dto)
    this.validateEventsReferenceLineup(dto.home)
    this.validateEventsReferenceLineup(dto.away)

    try {
      return await this.matchRepository.createWithPlayers(dto)
    } catch (err: unknown) {
      if (err instanceof ActiveSeasonNotFoundError) throw new NotFoundException(err.message)
      // FK violation: one or more player IDs do not exist
      if (isPostgresError(err) && err.code === '23503') throw new NotFoundException('One or more players not found')
      // Unique violation: player already registered in this match (concurrent request race)
      if (isPostgresError(err) && err.code === '23505') throw new BadRequestException('Duplicate player entry in match')
      throw err
    }
  }

  async listByGroup(dto: ListMatchesDto): Promise<PaginatedMatchesDto> {
    const { groupId, page = 1, pageSize = 20 } = dto
    const [groups, total] = await this.matchRepository.findByGroupAndActiveSeason(groupId, page, pageSize)

    const result = new PaginatedMatchesDto()
    result.data = groups.map((rows) => MatchResponseDto.fromRows(rows, this.s3UrlService))
    result.total = total
    result.page = page
    result.pageSize = pageSize
    return result
  }

  async findOne(matchId: number): Promise<MatchResponseDto> {
    const rows = await this.matchRepository.findById(matchId)
    if (!rows) throw new NotFoundException(`Match with id ${matchId} not found`)
    return MatchResponseDto.fromRows(rows, this.s3UrlService)
  }

  private validateNoOverlapBetweenTeams(dto: CreateMatchDto): void {
    const homeSet = new Set(dto.home.lineup)
    const duplicates = dto.away.lineup.filter((id) => homeSet.has(id))
    if (duplicates.length > 0) {
      throw new BadRequestException(`Players appear on both teams: ${duplicates.join(', ')}`)
    }
  }

  private validateEventsReferenceLineup(team: TeamInputDto): void {
    const lineupSet = new Set(team.lineup)

    const invalidGoal = team.goals.find((e) => !lineupSet.has(e.playerId))
    if (invalidGoal) {
      throw new BadRequestException(`Goal event references player ${invalidGoal.playerId} not in ${team.name} lineup`)
    }

    const invalidAssist = team.assists.find((e) => !lineupSet.has(e.playerId))
    if (invalidAssist) {
      throw new BadRequestException(`Assist event references player ${invalidAssist.playerId} not in ${team.name} lineup`)
    }
  }
}

function isPostgresError(err: unknown): err is { code: string } {
  return typeof err === 'object' && err !== null && 'code' in err
}
