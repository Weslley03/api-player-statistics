import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Group } from '../../groups/entities/group.entity'
import { Player } from '../../players/entities/player.entity'

export enum InvitationStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Expired = 'expired',
}

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group

  @Column({ name: 'group_id', type: 'uuid' })
  groupId: string

  @Index()
  @Column({ name: 'phone_number', type: 'varchar', length: 30 })
  phoneNumber: string

  @Column({ name: 'status', type: 'enum', enum: InvitationStatus })
  status: InvitationStatus

  @Index()
  @ManyToOne(() => Player, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invited_by' })
  invitedBy: Player

  @Column({ name: 'invited_by', type: 'uuid' })
  invitedById: string

  @Index()
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
