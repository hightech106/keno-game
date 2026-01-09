import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Operator Decorator
 * Extracts operator information from request
 * 
 * Usage: @Operator() operator: OperatorInfo
 */
export const Operator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // In production, this would come from JWT token or request context
    // For now, return from header or default
    return {
      operatorId: request.headers['x-operator-id'] || request.body?.operatorId || 'default-operator',
      // Add more operator info as needed
    };
  },
);
