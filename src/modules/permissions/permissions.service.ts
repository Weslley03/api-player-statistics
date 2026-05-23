import { Injectable } from '@nestjs/common'
import { PermissionRepository } from './repositories/permission.repository'

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async grantRole(playerId: string, groupId: string, role: string): Promise<void> {
    const permission = this.permissionRepository.create({ playerId, groupId, role })
    await this.permissionRepository.save(permission)
  }
}
