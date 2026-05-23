import { IsInt } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryMatchDto {
  @Type(() => Number)
  @IsInt()
  matchId: number
}
