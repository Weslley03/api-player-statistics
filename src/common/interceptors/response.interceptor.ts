import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Response } from 'express'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ApiResponse<T> {
  status: number
  message: string
  data: T
  timestamp: string
}

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>()

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode
        return {
          status: statusCode,
          message: HTTP_STATUS_MESSAGES[statusCode] ?? 'Success',
          data,
          timestamp: new Date().toISOString(),
        }
      }),
    )
  }
}
