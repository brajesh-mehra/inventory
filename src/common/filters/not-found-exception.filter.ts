import { Catch, ExceptionFilter, ArgumentsHost, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    return new RpcException({
      statusCode: 404,
      error: 'Not Found',
      message: exception.message || 'Resource not found',
    });
  }
}