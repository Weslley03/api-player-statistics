import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { IndividualAward } from '../../individual-awards/entities/individual-award.entity'
import { Match } from '../../matches/entities/match.entity'
import { MatchPlayer } from '../../match-players/entities/match-player.entity'
import { PlayerHasGroup } from '../../player-has-group/entities/player-has-group.entity'
import { PlayerStatistic } from '../../player-statistics/entities/player-statistic.entity'
import { Season } from '../../seasons/entities/season.entity'
import { IndividualAwardRawRow } from '../interfaces/individual-award-raw-row.interface'
import { MatchParticipationRawRow } from '../interfaces/match-participation-raw-row.interface'
import { PlayerStatsRawRow } from '../interfaces/player-stats-raw-row.interface'
import { Player } from '../entities/player.entity'

@Injectable()
export class PlayerRepository extends Repository<Player> {
  constructor(dataSource: DataSource) {
    super(Player, dataSource.createEntityManager())
  }

  async findWithStatsByPlayerAndGroup(playerId: string, groupId: string): Promise<PlayerStatsRawRow | undefined> {
    return this.createQueryBuilder('p')
      .innerJoin(PlayerHasGroup, 'phg', 'phg.playerId = p.id AND phg.groupId = :groupId', { groupId })
      .innerJoin(Season, 's', 's.groupId = :groupId AND s.isActive = :active', { active: true })
      .leftJoin(PlayerStatistic, 'ps', 'ps.playerId = p.id AND ps.groupId = :groupId AND ps.seasonId = s.id')
      .select([
        'p.id AS "id"',
        'p.name AS "name"',
        'p.position AS "position"',
        'p.club AS "clubName"',
        'p.avatarUrl AS "avatarUrl"',
        'COALESCE(ps.played, 0) AS "played"',
        'COALESCE(ps.wins, 0) AS "wins"',
        'COALESCE(ps.losses, 0) AS "losses"',
        'COALESCE(ps.draws, 0) AS "draws"',
        'COALESCE(ps.goals, 0) AS "goals"',
        'COALESCE(ps.assists, 0) AS "assists"',
        ':groupId AS "groupId"',
      ])
      .where('p.id = :playerId', { playerId })
      .getRawOne<PlayerStatsRawRow>()
  }

  async findMatchParticipationsByPlayerAndGroup(playerId: string, groupId: string): Promise<MatchParticipationRawRow[]> {
    return this.createQueryBuilder('p')
      .innerJoin(MatchPlayer, 'mp', 'mp.playerId = p.id')
      .innerJoin(Match, 'm', 'm.id = mp.matchId AND m.groupId = :groupId', { groupId })
      .innerJoin(Season, 's', 's.id = m.seasonId AND s.groupId = :groupId AND s.isActive = :active', { active: true })
      .select([
        'm.id AS "matchId"',
        'm.date AS "date"',
        'm.homeName AS "homeName"',
        'm.homeScore AS "homeScore"',
        'm.awayName AS "awayName"',
        'm.awayScore AS "awayScore"',
        'mp.team AS "team"',
        'mp.goals AS "goals"',
        'mp.assists AS "assists"',
      ])
      .where('p.id = :playerId', { playerId })
      .orderBy('m.date', 'DESC')
      .limit(5)
      .getRawMany<MatchParticipationRawRow>()
  }

  async findAwardsByPlayerAndGroup(playerId: string, groupId: string): Promise<IndividualAwardRawRow[]> {
    return this.createQueryBuilder('p')
      .innerJoin(IndividualAward, 'ia', 'ia.playerId = p.id AND ia.groupId = :groupId', { groupId })
      .innerJoin(Season, 's', 's.id = ia.seasonId AND s.isActive = :active', { active: true })
      .select(['ia.key AS "key"', 'ia.value AS "value"'])
      .where('p.id = :playerId', { playerId })
      .getRawMany<IndividualAwardRawRow>()
  }
}
