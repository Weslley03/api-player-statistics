import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Group } from '../entities/group.entity'

@Injectable()
export class GroupRepository extends Repository<Group> {
  constructor(dataSource: DataSource) {
    super(Group, dataSource.createEntityManager())
  }

  async findById(id: string): Promise<Group | null> {
    return this.findOne({ where: { id } })
  }

  async findByCode(code: string): Promise<Group | null> {
    return this.findOne({ where: { code } })
  }
}
