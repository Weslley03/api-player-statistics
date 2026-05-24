import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsUUID } from 'class-validator'

export class QueryMvpVotesDto {
  @Type(() => Number)
  @IsInt()
  matchId: number

  @IsOptional()
  @IsUUID()
  voterPlayerId?: string
}
