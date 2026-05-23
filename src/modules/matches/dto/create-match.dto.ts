import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDateString, IsInt, IsNotEmpty, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator'

export class MatchEventInputDto {
  @IsUUID()
  playerId: string

  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number
}

export class TeamInputDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsInt()
  @Min(0)
  @Max(99)
  score: number

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  lineup: string[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchEventInputDto)
  goals: MatchEventInputDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchEventInputDto)
  assists: MatchEventInputDto[]
}

export class CreateMatchDto {
  @IsUUID()
  groupId: string

  @IsDateString()
  date: string

  @ValidateNested()
  @Type(() => TeamInputDto)
  home: TeamInputDto

  @ValidateNested()
  @Type(() => TeamInputDto)
  away: TeamInputDto
}
