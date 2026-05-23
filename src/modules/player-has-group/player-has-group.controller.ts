import { Controller, Get, Query } from '@nestjs/common'
import { QueryPlayerHasGroupDto } from './dto/query-player-has-group.dto'
import { PlayerHasGroupService } from './player-has-group.service'

@Controller('/player-has-group')
export class PlayerHasGroupController {
  constructor(private readonly playerHasGroupService: PlayerHasGroupService) {}

  @Get()
  findAll(@Query() query: QueryPlayerHasGroupDto) {
    return this.playerHasGroupService.findPlayersByGroupCode(query.groupCode)
  }
}
