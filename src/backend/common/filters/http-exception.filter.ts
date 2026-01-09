import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { ErrorCode } from '../enums/error-codes.enum';

/**
 * Global Exception Filter
 * 
 * Converts all exceptions to standardized error responses
 * Does not leak internal stack traces (regulatory compliance)
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.ERR_SYSTEM_INTERNAL;
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        
        // Extract error code if provided
        if (responseObj.errorCode) {
          errorCode = responseObj.errorCode;
        }
      }

      // Map common HTTP exceptions to error codes
      if (status === HttpStatus.NOT_FOUND) {
        if (message.includes('Round')) {
          errorCode = ErrorCode.ERR_ROUND_NOT_FOUND;
        } else if (message.includes('Bet')) {
          errorCode = ErrorCode.ERR_BET_SELECTION_INVALID;
        }
      } else if (status === HttpStatus.BAD_REQUEST) {
        if (message.includes('Round is not open')) {
          errorCode = ErrorCode.ERR_ROUND_CLOSED;
        } else if (message.includes('Stake must be between')) {
          if (message.includes('below')) {
            errorCode = ErrorCode.ERR_BET_AMOUNT_TOO_LOW;
          } else {
            errorCode = ErrorCode.ERR_BET_AMOUNT_TOO_HIGH;
          }
        } else if (message.includes('Duplicate numbers')) {
          errorCode = ErrorCode.ERR_BET_SELECTION_DUPLICATE;
        } else if (message.includes('Wallet debit failed')) {
          errorCode = ErrorCode.ERR_WALLET_REJECTED;
        }
      } else if (status === HttpStatus.UNAUTHORIZED) {
        errorCode = ErrorCode.ERR_AUTH_INVALID_TOKEN;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }

    // Generate request ID for tracking
    const requestId = request.headers['x-request-id'] as string || 
                     `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const errorResponse = new ErrorResponseDto(errorCode, message, undefined, requestId);

    // Log error (without sensitive data)
    this.logger.error(
      `Error ${status}: ${errorCode} - ${message}`,
      {
        path: request.url,
        method: request.method,
        requestId,
        operatorId: request.headers['x-operator-id'],
      },
    );

    response.status(status).json(errorResponse);
  }
}
