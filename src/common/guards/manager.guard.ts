import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface'

@Injectable()
export class ManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>()
    if (!request.user?.isManager) {
      throw new ForbiddenException(`Only 'managers' can perform this action`)
    }
    return true
  }
}
