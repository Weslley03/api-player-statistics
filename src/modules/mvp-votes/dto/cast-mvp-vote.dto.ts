import { Type } from 'class-transformer'
import { IsInt, IsUUID } from 'class-validator'

export class CastMvpVoteDto {
  @Type(() => Number)
  @IsInt()
  matchId: number

  @IsUUID()
  votedPlayerId: string
}
