import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Ein unerwarteter interner Serverfehler ist aufgetreten';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    // 1. Standard NestJS HTTP-Exceptions (inkl. ValidationPipe-Fehler)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, any>;
        message = resObj.message || exception.message;
        errorCode = resObj.error || HttpStatus[status];
      } else {
        message = exception.message;
        errorCode = HttpStatus[status];
      }
    }
    // 2. Prisma Datenbank-Fehler sauber übersetzen (über den Fehlercode)
    else if (this.isPrismaKnownError(exception)) {
      switch (exception.code) {
        case 'P2002': // Unique Constraint Violation (z. B. E-Mail existiert schon)
          status = HttpStatus.CONFLICT;
          message = 'Ein Datensatz mit diesen eindeutigen Werten existiert bereits';
          errorCode = 'CONFLICT';
          break;
        case 'P2025': // Record not found
          status = HttpStatus.NOT_FOUND;
          message = 'Der angeforderte Datensatz wurde nicht gefunden';
          errorCode = 'NOT_FOUND';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Datenbank-Validierungsfehler';
          errorCode = `PRISMA_${exception.code}`;
          break;
      }
    }
    // 3. Unerwartete JavaScript-Fehler
    else if (exception instanceof Error) {
      this.logger.error(`Unhandled Error: ${exception.message}`, exception.stack);
    }

    // Einheitliche Fehler-Antwort senden
    response.status(status).json({
      success: false,
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private isPrismaKnownError(err: unknown): err is { code: string; message: string } {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      typeof (err as any).code === 'string' &&
      (err as any).code.startsWith('P')
    );
  }
}
