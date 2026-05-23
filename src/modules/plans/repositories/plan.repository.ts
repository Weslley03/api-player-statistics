import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Plan } from '../entities/plan.entity'

@Injectable()
export class PlanRepository extends Repository<Plan> {
  constructor(private readonly dataSource: DataSource) {
    super(Plan, dataSource.createEntityManager())
  }

  async findById(id: number): Promise<Plan | null> {
    return this.findOne({ where: { id } })
  }
}
