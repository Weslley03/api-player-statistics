import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Created } from '../../common/decorators/api-response.decorator'
import { GroupsService } from './groups.service'
import { CreateGroupDto } from './dto/create-group.dto'
import { QueryGroupDto } from './dto/query-group.dto'

@Controller('/groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Created()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto)
  }

  /**
   * search for a group by code.
   * expect the parameter in the query:
   * ?groupCode=<code>
   */
  @Get()
  findOne(@Query() query: QueryGroupDto) {
    return this.groupsService.findByCode(query.groupCode)
  }
}
