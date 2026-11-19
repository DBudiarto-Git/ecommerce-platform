import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@shared/decorators/public.decorator';
import { TOKEN_SERVICE_PORT } from '@shared/security/token-service.port';
import type { ITokenServicePort } from '@shared/security/token-service.port';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_SERVICE_PORT) private readonly tokenService: ITokenServicePort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Prüfen, ob die Route mit @Public() markiert ist
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 2. Bearer-Token aus dem Header extrahieren
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Kein Authentifizierungs-Token vorhanden');
    }

    // 3. Token über unseren abstrakten Port verifizieren und Payload am Request speichern
    try {
      const payload = await this.tokenService.verifyAccessToken(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token ist ungültig oder abgelaufen');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
