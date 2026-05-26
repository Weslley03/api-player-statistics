import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { IndividualAwardRepository } from '../individual-awards/repositories/individual-award.repository'
import { MatchPlayer } from '../match-players/entities/match-player.entity'
import { Match } from '../matches/entities/match.entity'
import { CastMvpVoteDto } from './dto/cast-mvp-vote.dto'
import { MvpVoteCount } from './interfaces/mvp-vote-count.interface'
import { MvpVoteRepository } from './repositories/mvp-vote.repository'

const MVP_KEY = 'mvp'
// 6h
const VOTING_WINDOW_MS = 6 * 60 * 60 * 1000

export interface MvpVotesResult {
  votes: MvpVoteCount[]
  myVote: string | null
  canVote: boolean
  totalVotes: number
}

@Injectable()
export class MvpVotesService {
  constructor(
    private readonly mvpVoteRepository: MvpVoteRepository,
    private readonly individualAwardRepository: IndividualAwardRepository,
    private readonly dataSource: DataSource,
  ) {}

  async castVote(dto: CastMvpVoteDto, voterPlayerId: string, voterGroupId: string): Promise<void> {
    const match = await this.dataSource.getRepository(Match).findOne({
      where: { id: dto.matchId, groupId: voterGroupId },
    })
    if (!match) throw new NotFoundException(`Match ${dto.matchId} not found in your group`)

    const deadline = match.createdAt.getTime() + VOTING_WINDOW_MS
    if (Date.now() > deadline) throw new BadRequestException('Voting period has ended for this match')

    const existingVote = await this.mvpVoteRepository.findByMatchAndVoter(dto.matchId, voterPlayerId)
    if (existingVote) throw new ConflictException('You have already voted for this match')

    const vote = this.mvpVoteRepository.create({
      matchId: dto.matchId,
      voterPlayerId,
      votedPlayerId: dto.votedPlayerId,
      groupId: voterGroupId,
      seasonId: match.seasonId,
    })
    await this.mvpVoteRepository.save(vote)
  }

  async getVotes(matchId: number, voterPlayerId?: string): Promise<MvpVotesResult> {
    const match = await this.dataSource.getRepository(Match).findOne({ where: { id: matchId } })
    if (!match) throw new NotFoundException(`Match with id ${matchId} not found`)

    const deadline = match.createdAt.getTime() + VOTING_WINDOW_MS
    const withinDeadline = Date.now() <= deadline

    const [votes, myVoteRecord, isParticipant] = await Promise.all([
      this.mvpVoteRepository.findVoteCountsByMatch(matchId),
      voterPlayerId ? this.mvpVoteRepository.findByMatchAndVoter(matchId, voterPlayerId) : Promise.resolve(null),
      voterPlayerId ? this.dataSource.getRepository(MatchPlayer).existsBy({ matchId, playerId: voterPlayerId }) : Promise.resolve(false),
    ])

    const canVote = withinDeadline && (voterPlayerId ? isParticipant : false)

    if (!withinDeadline && votes.length > 0) {
      await this.tryFinalizeMatchMvp(matchId, votes, match.groupId, match.seasonId)
    }

    const myVote = myVoteRecord?.votedPlayerId ?? null
    const totalVotes = votes.reduce((sum, v) => sum + v.count, 0)

    return { votes, myVote, canVote, totalVotes }
  }

  private async tryFinalizeMatchMvp(matchId: number, votes: MvpVoteCount[], groupId: string, seasonId: number): Promise<void> {
    const claimed: boolean = await this.mvpVoteRepository.markMatchAsFinalized(matchId)
    if (!claimed) return

    const maxCount = Math.max(...votes.map((v) => v.count))
    const winners = votes.filter((v) => v.count === maxCount)

    if (winners.length !== 1) return

    await this.individualAwardRepository.incrementAward(winners[0].playerId, groupId, seasonId, MVP_KEY)
  }
}
