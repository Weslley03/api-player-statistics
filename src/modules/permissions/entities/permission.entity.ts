import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Group } from '../../groups/entities/group.entity'
import { Player } from '../../players/entities/player.entity'
import { Role } from '../../roles/entities/role.entity'

@Entity('permissions')
export class Permission {
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
  @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role' })
  roleEntity: Role

  @Column({ name: 'role', type: 'varchar', length: 50 })
  role: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
