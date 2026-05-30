import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Group } from '../../groups/entities/group.entity'
import { Player } from '../../players/entities/player.entity'

@Entity('player_has_group')
export class PlayerHasGroup {
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

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 64, nullable: true })
  refreshTokenHash: string | null

  @Index({ unique: true })
  @Column({ name: 'refresh_token_jti', type: 'varchar', length: 36, nullable: true })
  refreshTokenJti: string | null

  @Column({ name: 'refresh_token_expires_at', type: 'timestamptz', nullable: true })
  refreshTokenExpiresAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
