import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateGroupDto } from './dto/create-group.dto'
import { Group } from './entities/group.entity'
import { GroupRepository } from './repositories/group.repository'

@Injectable()
export class GroupsService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async create(dto: CreateGroupDto): Promise<Group> {
    const existing = await this.groupRepository.findByCode(dto.code)
    if (existing) {
      throw new ConflictException(`Group with code "${dto.code}" already exists`)
    }

    const group = this.groupRepository.create(dto)
    return this.groupRepository.save(group)
  }

  async findByCode(code: string): Promise<Group> {
    const group = await this.groupRepository.findByCode(code)
    if (!group) throw new NotFoundException(`Group with code "${code}" not found`)
    return group
  }

  async findById(id: string): Promise<Group> {
    const group = await this.groupRepository.findById(id)
    if (!group) throw new NotFoundException(`Group ${id} not found`)
    return group
  }
}
