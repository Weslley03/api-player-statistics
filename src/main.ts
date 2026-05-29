import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { type Server } from 'http'
import { AppModule } from './app.module'
import { AllExceptionsFilter, HttpExceptionFilter } from './common/filters/http-exception.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { globalValidationPipe } from './common/pipes/validation.pipe'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')

  app.enableShutdownHooks()

  app.setGlobalPrefix('api/v1')

  app.useGlobalPipes(globalValidationPipe())
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter())
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor())

  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  const port = process.env.PORT ?? 3000
  await app.listen(port)

  // kill requests that have been waiting more than 30s — prevents socket
  // exhaustion when the DB pool is saturated or a query hangs.
  ;(app.getHttpServer() as Server).setTimeout(30_000)

  logger.log(`application running on http://localhost:${port}/api/v1`)
}

void bootstrap()
