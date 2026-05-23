import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Permission } from '../entities/permission.entity'

@Injectable()
export class PermissionRepository extends Repository<Permission> {
  constructor(dataSource: DataSource) {
    super(Permission, dataSource.createEntityManager())
  }
}
