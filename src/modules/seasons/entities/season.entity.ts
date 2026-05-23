import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Group } from '../../groups/entities/group.entity'

@Index(['groupId', 'indicator'], { unique: true })
@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group

  @Column({ name: 'group_id', type: 'uuid' })
  groupId: string

  @Column({ name: 'indicator', type: 'int' })
  indicator: number

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
