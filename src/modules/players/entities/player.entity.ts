import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum PlayerPosition {
  Goalkeeper = 'GOL',
  Defender = 'ZAG',
  Midfielder = 'MEI',
  Forward = 'ATA',
}

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string

  @Index({ unique: true })
  @Column({ name: 'phone_number', type: 'varchar', length: 30, nullable: true })
  phoneNumber: string | null

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password: string | null

  @Column({ name: 'club', type: 'varchar', length: 255, nullable: true })
  club: string | null

  @Column({ name: 'position', type: 'varchar', length: 50, nullable: true })
  position: PlayerPosition | null

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null
}
