import { Injectable } from '@nestjs/common'
import { Season } from './entities/season.entity'
import { SeasonRepository } from './repositories/season.repository'

@Injectable()
export class SeasonsService {
  constructor(private readonly seasonRepository: SeasonRepository) {}

  async createInitial(groupId: string): Promise<Season> {
    const season = this.seasonRepository.create({ groupId, indicator: 1, isActive: true })
    return this.seasonRepository.save(season)
  }
}
