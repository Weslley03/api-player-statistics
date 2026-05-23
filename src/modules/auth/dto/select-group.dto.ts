import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class SelectGroupDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsUUID()
  @IsNotEmpty()
  groupId: string
}
