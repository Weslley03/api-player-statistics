import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { IndividualAward } from '../entities/individual-award.entity'

@Injectable()
export class IndividualAwardRepository extends Repository<IndividualAward> {
  constructor(dataSource: DataSource) {
    super(IndividualAward, dataSource.createEntityManager())
  }

  async incrementAward(playerId: string, groupId: string, seasonId: number, key: string): Promise<void> {
    const existing = await this.findOne({ where: { playerId, groupId, seasonId, key } })
    if (existing) {
      await this.update(existing.id, { value: existing.value + 1 })
    } else {
      const award = this.create({ playerId, groupId, seasonId, key, value: 1 })
      await this.save(award)
    }
  }
}
