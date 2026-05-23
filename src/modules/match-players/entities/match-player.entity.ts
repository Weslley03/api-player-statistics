import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Match } from '../../matches/entities/match.entity'
import { Player } from '../../players/entities/player.entity'

export enum MatchTeam {
  Home = 'home',
  Away = 'away',
}

@Index(['playerId', 'goals'])
@Entity('match_players')
export class MatchPlayer {
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
  @JoinColumn({ name: 'player_id' })
  player: Player

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string

  @Column({ name: 'team', type: 'enum', enum: MatchTeam })
  team: MatchTeam

  @Column({ name: 'goals', type: 'int' })
  goals: number

  @Column({ name: 'assists', type: 'int' })
  assists: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
