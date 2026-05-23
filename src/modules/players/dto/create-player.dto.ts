import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator'

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'phoneNumber must contain only digits with DDD (e.g. 4412345678)' })
  phoneNumber?: string
}
