import { IntersectionType } from '@nestjs/mapped-types'
import { IsUUID } from 'class-validator'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class ListMatchesDto extends IntersectionType(PaginationDto) {
  @IsUUID()
  groupId: string
}
