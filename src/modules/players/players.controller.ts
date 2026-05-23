import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { ManagerGuard } from '../../common/guards/manager.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { CreatePlayerDto } from './dto/create-player.dto'
import { QueryPlayerDto } from './dto/query-player.dto'
import { UpdatePlayerDto } from './dto/update-player.dto'
import { PlayersService } from './players.service'
import { AVATAR_MAX_BYTES } from './constants'

@Controller('/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, ManagerGuard)
  create(@Body() dto: CreatePlayerDto, @CurrentUser() user: JwtPayload) {
    return this.playersService.create(dto, user.sub, user.groupId)
  }

  @Get()
  findById(@Query() query: QueryPlayerDto) {
    return this.playersService.findById(query.playerId, query.groupCode)
  }

  @Get('/clubs')
  @UseGuards(JwtAuthGuard)
  listClubs() {
    return this.playersService.listClubs()
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: AVATAR_MAX_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
          callback(new BadRequestException('Avatar must be a JPEG, PNG, or WebP image'), false)
        } else {
          callback(null, true)
        }
      },
    }),
  )
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePlayerDto, @CurrentUser() user: JwtPayload, @UploadedFile() avatar?: { buffer: Buffer; mimetype: string }) {
    return this.playersService.update(id, dto, avatar, user)
  }
}
