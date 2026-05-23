import { PlayerPosition } from '../../players/entities/player.entity'
import { S3UrlService } from '../../../common/services/s3-url.service'
import { MatchRawRow } from '../interfaces/match-raw-row.interface'

const POSITION_ORDER: Record<string, number> = {
  [PlayerPosition.Goalkeeper]: 0,
  [PlayerPosition.Defender]: 1,
  [PlayerPosition.Midfielder]: 2,
  [PlayerPosition.Forward]: 3,
}

export class LineupEntryDto {
  id: string
  name: string
  position: string | null
  avatar: string | null
}

export class MatchEventDto {
  playerId: string
  player: string
  avatar: string | null
  quantity: number
}

export class TeamMatchDto {
  name: string
  score: number
  lineup: LineupEntryDto[]
  goals: MatchEventDto[]
  assists: MatchEventDto[]
}

export class MatchResponseDto {
  id: number
  date: string
  groupId: string
  home: TeamMatchDto
  away: TeamMatchDto

  static fromRows(rows: MatchRawRow[], s3: S3UrlService): MatchResponseDto {
    const first = rows[0]

    const dto = new MatchResponseDto()
    dto.id = first.matchId
    dto.date = first.date
    dto.groupId = first.groupId

    dto.home = buildTeam(first.homeName, first.homeScore, rows, 'home', s3)
    dto.away = buildTeam(first.awayName, first.awayScore, rows, 'away', s3)

    return dto
  }
}

export class PaginatedMatchesDto {
  data: MatchResponseDto[]
  total: number
  page: number
  pageSize: number
}

function buildTeam(name: string, score: number, rows: MatchRawRow[], side: string, s3: S3UrlService): TeamMatchDto {
  const teamRows = rows.filter((r) => r.team === side)

  const lineup: LineupEntryDto[] = teamRows
    .map((r) => ({ id: r.playerId, name: r.playerName, position: r.playerPosition, avatar: s3.buildAvatarUrl(r.playerId, r.playerAvatarUrl) }))
    .sort((a, b) => positionOrder(a.position) - positionOrder(b.position))

  const goals: MatchEventDto[] = teamRows
    .filter((r) => r.goals > 0)
    .map((r) => ({ playerId: r.playerId, player: r.playerName, avatar: s3.buildAvatarUrl(r.playerId, r.playerAvatarUrl), quantity: r.goals }))

  const assists: MatchEventDto[] = teamRows
    .filter((r) => r.assists > 0)
    .map((r) => ({ playerId: r.playerId, player: r.playerName, avatar: s3.buildAvatarUrl(r.playerId, r.playerAvatarUrl), quantity: r.assists }))

  const team = new TeamMatchDto()
  team.name = name
  team.score = score
  team.lineup = lineup
  team.goals = goals
  team.assists = assists
  return team
}

function positionOrder(position: string | null): number {
  if (!position) return 99
  return POSITION_ORDER[position] ?? 99
}
