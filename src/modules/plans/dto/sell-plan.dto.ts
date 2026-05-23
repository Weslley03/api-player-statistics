import { IsInt, IsNotEmpty, IsPositive, IsString, Matches, MaxLength } from 'class-validator'

export class SellPlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  playerName: string

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,11}$/, { message: 'playerPhoneNumber must contain only digits with DDD (e.g. 4412345678)' })
  playerPhoneNumber: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  groupCode: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  groupDescription: string

  @IsInt()
  @IsPositive()
  planId: number
}
