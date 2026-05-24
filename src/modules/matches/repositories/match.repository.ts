import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { MatchPlayer, MatchTeam } from '../../match-players/entities/match-player.entity'
import { Player } from '../../players/entities/player.entity'
import { Season } from '../../seasons/entities/season.entity'
import { MatchRawRow } from '../interfaces/match-raw-row.interface'
import { Match } from '../entities/match.entity'
import { CreateMatchDto, MatchEventInputDto, TeamInputDto } from '../dto/create-match.dto'

const MVP_SUBQUERIES = [
  `(SELECT mv2.voted_player_id::text FROM mvp_votes mv2 WHERE mv2.match_id = m.id AND mv2.is_finalized = true GROUP BY mv2.voted_player_id ORDER BY COUNT(*) DESC LIMIT 1) AS "mvpPlayerId"`,
  `(SELECT p2.name FROM mvp_votes mv2 INNER JOIN players p2 ON p2.id = mv2.voted_player_id WHERE mv2.match_id = m.id AND mv2.is_finalized = true GROUP BY mv2.voted_player_id, p2.name ORDER BY COUNT(*) DESC LIMIT 1) AS "mvpPlayerName"`,
  `(SELECT p2.avatar_url FROM mvp_votes mv2 INNER JOIN players p2 ON p2.id = mv2.voted_player_id WHERE mv2.match_id = m.id AND mv2.is_finalized = true GROUP BY mv2.voted_player_id, p2.avatar_url ORDER BY COUNT(*) DESC LIMIT 1) AS "mvpAvatarUrl"`,
] as const

export class ActiveSeasonNotFoundError extends Error {
  constructor(groupId: string) {
    super(`No active season found for group ${groupId}`)
    this.name = 'ActiveSeasonNotFoundError'
  }
}

type StatDelta = {
  playerId: string
  groupId: string
  seasonId: number
  played: number
  wins: number
  losses: number
  draws: number
  goals: number
  assists: number
}

@Injectable()
export class MatchRepository extends Repository<Match> {
  constructor(private readonly dataSource: DataSource) {
    super(Match, dataSource.createEntityManager())
  }

  async createWithPlayers(dto: CreateMatchDto): Promise<Match> {
    return this.dataSource.transaction(async (manager) => {
      const season = await manager.findOne(Season, {
        where: { groupId: dto.groupId, isActive: true },
      })
      if (!season) throw new ActiveSeasonNotFoundError(dto.groupId)

      const match = manager.create(Match, {
        groupId: dto.groupId,
        seasonId: season.id,
        date: new Date(dto.date),
        homeName: dto.home.name,
        homeScore: dto.home.score,
        awayName: dto.away.name,
        awayScore: dto.away.score,
      })
      const savedMatch = await manager.save(Match, match)

      const matchPlayerRows = [
        ...dto.home.lineup.map((playerId) => buildMatchPlayerRow(savedMatch.id, playerId, MatchTeam.Home, dto.home)),
        ...dto.away.lineup.map((playerId) => buildMatchPlayerRow(savedMatch.id, playerId, MatchTeam.Away, dto.away)),
      ]
      await manager.insert(MatchPlayer, matchPlayerRows)

      const deltas = computeStatDeltas(dto.home, dto.away, dto.groupId, season.id)
      await upsertPlayerStatistics(manager, deltas)

      return savedMatch
    })
  }

  async countByGroupAndActiveSeason(groupId: string): Promise<number> {
    const row = await this.createQueryBuilder('m')
      .innerJoin(Season, 's', 's.id = m.seasonId AND s.groupId = :groupId AND s.isActive = :active', { groupId, active: true })
      .where('m.groupId = :groupId', { groupId })
      .select('COUNT(m.id)', 'count')
      .getRawOne<{ count: string }>()
    return parseInt(row?.count ?? '0', 10)
  }

  async findByGroupAndActiveSeason(groupId: string, page: number, pageSize: number): Promise<[MatchRawRow[][], number]> {
    const offset = (page - 1) * pageSize

    const countRow = await this.createQueryBuilder('m')
      .innerJoin(Season, 's', 's.id = m.seasonId AND s.groupId = :groupId AND s.isActive = :active', { groupId, active: true })
      .where('m.groupId = :groupId', { groupId })
      .select('COUNT(DISTINCT m.id)', 'count')
      .getRawOne<{ count: string }>()

    const total = parseInt(countRow?.count ?? '0', 10)

    const matchIds = await this.createQueryBuilder('m')
      .innerJoin(Season, 's', 's.id = m.seasonId AND s.groupId = :groupId AND s.isActive = :active', { groupId, active: true })
      .where('m.groupId = :groupId', { groupId })
      .select('m.id', 'id')
      .orderBy('m.date', 'DESC')
      .limit(pageSize)
      .offset(offset)
      .getRawMany<{ id: number }>()

    if (!matchIds.length) return [[], total]

    const ids = matchIds.map((r) => r.id)

    const rows = await this.createQueryBuilder('m')
      .innerJoin(MatchPlayer, 'mp', 'mp.matchId = m.id')
      .innerJoin(Player, 'p', 'p.id = mp.playerId')
      .where('m.id IN (:...ids)', { ids })
      .select([
        'm.id AS "matchId"',
        'm.date AS "date"',
        'm.groupId AS "groupId"',
        'm.homeName AS "homeName"',
        'm.homeScore AS "homeScore"',
        'm.awayName AS "awayName"',
        'm.awayScore AS "awayScore"',
        'p.id AS "playerId"',
        'p.name AS "playerName"',
        'p.position AS "playerPosition"',
        'p.avatarUrl AS "playerAvatarUrl"',
        'mp.team AS "team"',
        'mp.goals AS "goals"',
        'mp.assists AS "assists"',
        ...MVP_SUBQUERIES,
      ])
      .orderBy('m.date', 'DESC')
      .getRawMany<MatchRawRow>()

    const grouped = groupByMatch(rows, ids)
    return [grouped, total]
  }

  async findById(matchId: number): Promise<MatchRawRow[] | null> {
    const rows = await this.createQueryBuilder('m')
      .innerJoin(MatchPlayer, 'mp', 'mp.matchId = m.id')
      .innerJoin(Player, 'p', 'p.id = mp.playerId')
      .where('m.id = :matchId', { matchId })
      .select([
        'm.id AS "matchId"',
        'm.date AS "date"',
        'm.groupId AS "groupId"',
        'm.homeName AS "homeName"',
        'm.homeScore AS "homeScore"',
        'm.awayName AS "awayName"',
        'm.awayScore AS "awayScore"',
        'p.id AS "playerId"',
        'p.name AS "playerName"',
        'p.position AS "playerPosition"',
        'p.avatarUrl AS "playerAvatarUrl"',
        'mp.team AS "team"',
        'mp.goals AS "goals"',
        'mp.assists AS "assists"',
        ...MVP_SUBQUERIES,
      ])
      .getRawMany<MatchRawRow>()

    return rows.length ? rows : null
  }
}

function buildMatchPlayerRow(matchId: number, playerId: string, team: MatchTeam, teamDto: TeamInputDto): Partial<MatchPlayer> {
  const goals = teamDto.goals.filter((e) => e.playerId === playerId).reduce((sum, e) => sum + e.quantity, 0)
  const assists = teamDto.assists.filter((e) => e.playerId === playerId).reduce((sum, e) => sum + e.quantity, 0)
  return { matchId, playerId, team, goals, assists }
}

function computeStatDeltas(home: TeamInputDto, away: TeamInputDto, groupId: string, seasonId: number): StatDelta[] {
  const homeWon = home.score > away.score
  const awayWon = away.score > home.score
  const drew = home.score === away.score

  const deltas = new Map<string, StatDelta>()

  for (const playerId of home.lineup) {
    deltas.set(playerId, {
      playerId,
      groupId,
      seasonId,
      played: 1,
      wins: homeWon ? 1 : 0,
      losses: awayWon ? 1 : 0,
      draws: drew ? 1 : 0,
      goals: 0,
      assists: 0,
    })
  }

  for (const playerId of away.lineup) {
    deltas.set(playerId, {
      playerId,
      groupId,
      seasonId,
      played: 1,
      wins: awayWon ? 1 : 0,
      losses: homeWon ? 1 : 0,
      draws: drew ? 1 : 0,
      goals: 0,
      assists: 0,
    })
  }

  const applyEvent = (event: MatchEventInputDto, field: 'goals' | 'assists') => {
    const d = deltas.get(event.playerId)
    if (d) d[field] += event.quantity
  }

  home.goals.forEach((e) => applyEvent(e, 'goals'))
  home.assists.forEach((e) => applyEvent(e, 'assists'))
  away.goals.forEach((e) => applyEvent(e, 'goals'))
  away.assists.forEach((e) => applyEvent(e, 'assists'))

  return Array.from(deltas.values())
}

async function upsertPlayerStatistics(manager: EntityManager, deltas: StatDelta[]): Promise<void> {
  if (deltas.length === 0) return

  const placeholders = deltas
    .map((_, i) => {
      const b = i * 9
      return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8},$${b + 9},0,now(),now())`
    })
    .join(',')

  const values = deltas.flatMap((d) => [d.playerId, d.groupId, d.seasonId, d.played, d.wins, d.losses, d.draws, d.goals, d.assists])

  await manager.query(
    `INSERT INTO player_statistics
       (player_id, group_id, season_id, played, wins, losses, draws, goals, assists, overall, created_at, updated_at)
     VALUES ${placeholders}
     ON CONFLICT (player_id, season_id) DO UPDATE SET
       played     = player_statistics.played     + EXCLUDED.played,
       wins       = player_statistics.wins       + EXCLUDED.wins,
       losses     = player_statistics.losses     + EXCLUDED.losses,
       draws      = player_statistics.draws      + EXCLUDED.draws,
       goals      = player_statistics.goals      + EXCLUDED.goals,
       assists    = player_statistics.assists    + EXCLUDED.assists,
       updated_at = now()`,
    values,
  )
}

function groupByMatch(rows: MatchRawRow[], orderedIds: number[]): MatchRawRow[][] {
  const map = new Map<number, MatchRawRow[]>()
  for (const row of rows) {
    const bucket = map.get(row.matchId) ?? []
    bucket.push(row)
    map.set(row.matchId, bucket)
  }
  return orderedIds.map((id) => map.get(id) ?? []).filter((g) => g.length > 0)
}
