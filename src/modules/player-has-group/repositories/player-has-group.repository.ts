import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { PlayerHasGroup } from '../entities/player-has-group.entity'
import { PlayerStatistic } from '../../player-statistics/entities/player-statistic.entity'
import { Season } from '../../seasons/entities/season.entity'

export interface PlayerRawRow {
  id: string
  name: string
  position: string | null
  clubName: string | null
  avatarUrl: string | null
  played: number
  wins: number
  losses: number
  draws: number
  goals: number
  assists: number
  groupId: string
}

@Injectable()
export class PlayerHasGroupRepository extends Repository<PlayerHasGroup> {
  constructor(dataSource: DataSource) {
    super(PlayerHasGroup, dataSource.createEntityManager())
  }

  async existsByPlayerAndGroup(playerId: string, groupId: string): Promise<boolean> {
    const count = await this.count({ where: { playerId, groupId } })
    return count > 0
  }

  async countByGroupId(groupId: string): Promise<number> {
    return this.count({ where: { groupId } })
  }

  async findPlayersByGroupId(groupId: string): Promise<PlayerRawRow[]> {
    return this.createQueryBuilder('phg')
      .innerJoin('phg.player', 'p')
      .innerJoin(Season, 's', 's.groupId = phg.groupId AND s.isActive = :active', { active: true })
      .leftJoin(PlayerStatistic, 'ps', 'ps.playerId = phg.playerId AND ps.groupId = phg.groupId AND ps.seasonId = s.id')
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
        'phg.groupId AS "groupId"',
      ])
      .where('phg.groupId = :groupId', { groupId })
      .getRawMany<PlayerRawRow>()
  }
}
