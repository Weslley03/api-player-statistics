import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { Created } from '../../common/decorators/api-response.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { CastMvpVoteDto } from './dto/cast-mvp-vote.dto'
import { QueryMvpVotesDto } from './dto/query-mvp-votes.dto'
import { MvpVotesService } from './mvp-votes.service'

@Controller('/mvp-votes')
export class MvpVotesController {
  constructor(private readonly mvpVotesService: MvpVotesService) {}

  @Post()
  @Created()
  @UseGuards(JwtAuthGuard)
  castVote(@Body() dto: CastMvpVoteDto, @CurrentUser() user: JwtPayload) {
    return this.mvpVotesService.castVote(dto, user.sub, user.groupId)
  }

  @Get()
  getVotes(@Query() query: QueryMvpVotesDto) {
    return this.mvpVotesService.getVotes(query.matchId, query.voterPlayerId)
  }
}
