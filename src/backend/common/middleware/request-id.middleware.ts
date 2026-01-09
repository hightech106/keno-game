import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID Middleware
 * 
 * Generates a unique request ID for each request and attaches it to:
 * - Request headers (x-request-id)
 * - Response headers (x-request-id)
 * - Request object (for use in controllers/services)
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Use existing request ID from header, or generate new one
    const requestId = (req.headers['x-request-id'] as string) || 
                     `req-${Date.now()}-${uuidv4().substring(0, 8)}`;
    
    // Attach to request
    req.headers['x-request-id'] = requestId;
    (req as any).requestId = requestId;
    
    // Add to response headers
    res.setHeader('x-request-id', requestId);
    
    next();
  }
}
