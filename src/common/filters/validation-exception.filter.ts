import { ArgumentsHost, Catch, ExceptionFilter, BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const exceptionResponse = exception.getResponse();
    const firstError = Array.isArray((exceptionResponse as any).message)
      ? (exceptionResponse as any).message[0]
      : (exceptionResponse as any).message || 'Validation failed';

    // Instead of throwing RpcException here, just return the correct response
    return new RpcException({
      statusCode: 400,
      error: 'Bad Request',
      message: firstError,
    });
  }
}