import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Group } from '../../groups/entities/group.entity'
import { Plan } from '../../plans/entities/plan.entity'

export enum SubscriptionStatus {
  Active = 'active',
  Expired = 'expired',
  Cancelled = 'cancelled',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group

  @Column({ name: 'group_id', type: 'uuid' })
  groupId: string

  @Index()
  @ManyToOne(() => Plan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan

  @Column({ name: 'plan_id', type: 'int' })
  planId: number

  @Column({ name: 'status', type: 'enum', enum: SubscriptionStatus })
  status: SubscriptionStatus

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date

  @Index()
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
