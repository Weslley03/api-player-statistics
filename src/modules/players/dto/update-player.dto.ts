import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator'
import { PlayerPosition } from '../entities/player.entity'

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'phoneNumber must contain only digits with DDD (e.g. 4412345678)' })
  phoneNumber?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  club?: string

  @IsOptional()
  @IsEnum(PlayerPosition)
  position?: PlayerPosition
}
