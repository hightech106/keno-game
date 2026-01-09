import { ErrorCode } from '../enums/error-codes.enum';

/**
 * Standardized Error Response
 * 
 * All API errors return this format for consistency and regulatory compliance
 */
export class ErrorResponseDto {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    timestamp: string;
    requestId?: string;
    details?: Record<string, any>;
  };

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, any>,
    requestId?: string,
  ) {
    this.success = false;
    this.error = {
      code,
      message,
      timestamp: new Date().toISOString(),
      requestId,
      ...(details && { details }),
    };
  }
}
