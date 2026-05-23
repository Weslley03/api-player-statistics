import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class QueryGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  groupCode: string
}
