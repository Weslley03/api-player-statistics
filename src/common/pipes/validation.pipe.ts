import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common'

export const globalValidationPipe = (): ValidationPipe =>
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  } satisfies ValidationPipeOptions)
