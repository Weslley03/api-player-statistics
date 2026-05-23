import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Role } from '../../roles/entities/role.entity'

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null

  @Index()
  @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role' })
  roleEntity: Role

  @Column({ name: 'role', type: 'varchar', length: 50 })
  role: string

  @Column({ name: 'player_limit', type: 'int' })
  playerLimit: number

  @Column({ name: 'match_limit', type: 'int' })
  matchLimit: number

  @Column({ name: 'price_cents', type: 'int' })
  priceCents: number

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
