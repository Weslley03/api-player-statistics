import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('roles')
export class Role {
  @PrimaryColumn({ name: 'role', type: 'varchar', length: 50 })
  role: string

  @Column({ name: 'description', type: 'varchar', length: 255 })
  description: string

  @Column({ name: 'is_admin', type: 'boolean' })
  isAdmin: boolean

  @Column({ name: 'is_manager', type: 'boolean' })
  isManager: boolean

  @Column({ name: 'is_user', type: 'boolean' })
  isUser: boolean
}
