import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Current Operator Decorator
 * Extracts operator information from JWT token (after authentication)
 * 
 * Usage: @CurrentOperator() operator: { operatorId: string, operator: Operator }
 */
export const CurrentOperator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Set by JWT strategy after validation
  },
);
