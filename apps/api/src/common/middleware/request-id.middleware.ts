import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { generateRequestId } from '@entec/shared';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const requestId =
            (req.headers['x-request-id'] as string) || generateRequestId();
        req.headers['x-request-id'] = requestId;
        res.setHeader('X-Request-Id', requestId);
        next();
    }
}
