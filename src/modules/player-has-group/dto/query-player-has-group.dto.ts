import { IsNotEmpty, IsString } from 'class-validator'

export class QueryPlayerHasGroupDto {
  @IsString()
  @IsNotEmpty()
  groupCode: string
}
