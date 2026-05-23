import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Season } from '../entities/season.entity'

@Injectable()
export class SeasonRepository extends Repository<Season> {
  constructor(private readonly dataSource: DataSource) {
    super(Season, dataSource.createEntityManager())
  }
}
