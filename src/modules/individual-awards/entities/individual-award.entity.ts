import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Group } from '../../groups/entities/group.entity'
import { Player } from '../../players/entities/player.entity'
import { Season } from '../../seasons/entities/season.entity'

@Index(['groupId', 'seasonId'])
@Entity('individual_awards')
export class IndividualAward {
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

  @Column({ name: 'key', type: 'varchar', length: 100 })
  key: string

  @Column({ name: 'value', type: 'int' })
  value: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
