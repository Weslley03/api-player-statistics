import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common'

export const Created = () => applyDecorators(HttpCode(HttpStatus.CREATED))

export const NoContent = () => applyDecorators(HttpCode(HttpStatus.NO_CONTENT))
