import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { SelectGroupDto } from './dto/select-group.dto'

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('/select-group')
  @HttpCode(HttpStatus.OK)
  selectGroup(@Body() dto: SelectGroupDto) {
    return this.authService.selectGroup(dto)
  }
}
