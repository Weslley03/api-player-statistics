import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Group } from '../../groups/entities/group.entity'
import { Player } from '../../players/entities/player.entity'
import { Season } from '../../seasons/entities/season.entity'

@Index(['seasonId', 'overall'])
@Index(['groupId', 'seasonId'])
@Entity('player_statistics')
export class PlayerStatistic {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string

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

  @Column({ name: 'played', type: 'int' })
  played: number

  @Column({ name: 'wins', type: 'int' })
  wins: number

  @Column({ name: 'losses', type: 'int' })
  losses: number

  @Column({ name: 'draws', type: 'int' })
  draws: number

  @Column({ name: 'goals', type: 'int' })
  goals: number

  @Column({ name: 'assists', type: 'int' })
  assists: number

  @Column({ name: 'overall', type: 'int' })
  overall: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
