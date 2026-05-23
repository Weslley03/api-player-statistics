import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { Created } from '../../common/decorators/api-response.decorator'
import { CreateMatchDto } from './dto/create-match.dto'
import { ListMatchesDto } from './dto/list-matches.dto'
import { QueryMatchDto } from './dto/query-match.dto'
import { MatchesService } from './matches.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ManagerGuard } from '../../common/guards/manager.guard'

@Controller('/matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @Created()
  @UseGuards(JwtAuthGuard, ManagerGuard)
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto)
  }

  @Post('/list')
  listByGroup(@Body() dto: ListMatchesDto) {
    return this.matchesService.listByGroup(dto)
  }

  /**
   * search for a match by id.
   * expect the parameter in the query:
   * ?matchId=<id>
   */
  @Get()
  findOne(@Query() query: QueryMatchDto) {
    return this.matchesService.findOne(query.matchId)
  }
}
