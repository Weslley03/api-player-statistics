import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Group } from '../../groups/entities/group.entity'
import { Season } from '../../seasons/entities/season.entity'

@Index(['groupId', 'seasonId'])
@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number

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

  @Index()
  @Column({ name: 'date', type: 'date' })
  date: Date

  @Column({ name: 'home_name', type: 'varchar', length: 255 })
  homeName: string

  @Column({ name: 'away_name', type: 'varchar', length: 255 })
  awayName: string

  @Column({ name: 'home_score', type: 'int' })
  homeScore: number

  @Column({ name: 'away_score', type: 'int' })
  awayScore: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
