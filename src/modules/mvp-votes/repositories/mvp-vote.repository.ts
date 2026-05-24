import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Player } from '../../players/entities/player.entity'
import { MvpVoteCount } from '../interfaces/mvp-vote-count.interface'
import { MvpVote } from '../entities/mvp-vote.entity'

interface MvpVoteCountRaw {
  playerId: string
  playerName: string
  avatarUrl: string | null
  count: string
}

@Injectable()
export class MvpVoteRepository extends Repository<MvpVote> {
  constructor(dataSource: DataSource) {
    super(MvpVote, dataSource.createEntityManager())
  }

  async findByMatchAndVoter(matchId: number, voterPlayerId: string): Promise<MvpVote | null> {
    return this.findOne({ where: { matchId, voterPlayerId } })
  }

  async markMatchAsFinalized(matchId: number): Promise<boolean> {
    const result = await this.update({ matchId, isFinalized: false }, { isFinalized: true })
    return (result.affected ?? 0) > 0
  }

  async isMatchFinalized(matchId: number): Promise<boolean> {
    const count = await this.count({ where: { matchId, isFinalized: true } })
    return count > 0
  }

  async findVoteCountsByMatch(matchId: number): Promise<MvpVoteCount[]> {
    const rows = await this.createQueryBuilder('mv')
      .innerJoin(Player, 'p', 'p.id = mv.votedPlayerId')
      .where('mv.matchId = :matchId', { matchId })
      .select(['mv.voted_player_id AS "playerId"', 'p.name AS "playerName"', 'p.avatarUrl AS "avatarUrl"', 'COUNT(mv.id)::int AS "count"'])
      .groupBy('mv.voted_player_id, p.name, p.avatarUrl')
      .orderBy('"count"', 'DESC')
      .getRawMany<MvpVoteCountRaw>()

    return rows.map((r) => ({ ...r, count: Number(r.count) }))
  }
}
