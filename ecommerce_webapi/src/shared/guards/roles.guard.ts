import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppRole, ROLES_KEY } from '@shared/decorators/roles.decorator';
import { JwtPayload } from '@shared/security/token-service.port';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Wenn kein @Roles()-Decorator gesetzt ist, reicht ein gültiger Login
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload | undefined = request.user;

    if (!user || !requiredRoles.includes(user.role as AppRole)) {
      throw new ForbiddenException(
        `Zugriff verweigert: Erforderliche Rolle (${requiredRoles.join(', ')}) fehlt`,
      );
    }

    return true;
  }
}
