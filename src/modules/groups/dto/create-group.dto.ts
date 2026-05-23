import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  code: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  description: string
}
