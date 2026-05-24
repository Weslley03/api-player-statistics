import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Group } from '../../groups/entities/group.entity'
import { Match } from '../../matches/entities/match.entity'
import { Player } from '../../players/entities/player.entity'
import { Season } from '../../seasons/entities/season.entity'

@Index(['matchId', 'voterPlayerId'], { unique: true })
@Entity('mvp_votes')
export class MvpVote {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @ManyToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match

  @Column({ name: 'match_id', type: 'int' })
  matchId: number

  @Index()
  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voter_player_id' })
  voterPlayer: Player

  @Column({ name: 'voter_player_id', type: 'uuid' })
  voterPlayerId: string

  @Index()
  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voted_player_id' })
  votedPlayer: Player

  @Column({ name: 'voted_player_id', type: 'uuid' })
  votedPlayerId: string

  @Index()
  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group

  @Column({ name: 'group_id', type: 'uuid' })
  groupId: string

  @Index()
  @ManyToOne(() => Season, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season: Season

  @Column({ name: 'season_id', type: 'int' })
  seasonId: number

  @Column({ name: 'is_finalized', type: 'boolean', default: false })
  isFinalized: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
