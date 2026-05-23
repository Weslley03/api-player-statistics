import { IsString, IsUUID } from 'class-validator'

export class QueryPlayerDto {
  @IsUUID()
  playerId: string

  @IsString()
  groupCode: string
}
