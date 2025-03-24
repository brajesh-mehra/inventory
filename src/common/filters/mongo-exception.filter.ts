import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { MongoServerError } from 'mongodb';

@Catch(MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoServerError, host: ArgumentsHost) {
    if (exception.code === 11000) {
      const fieldName = Object.keys(exception.keyPattern)[0];
      return new RpcException({
        statusCode: 409,
        error: 'Conflict',
        message: `${fieldName} already exists. Please use a different ${fieldName}.`,
      });
    }

    return new RpcException({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
}