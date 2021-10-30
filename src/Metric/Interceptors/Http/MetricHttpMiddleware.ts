import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class MetricHttpMiddleware implements NestMiddleware {
  use(req, res, next) {
    req['startAt'] = process.hrtime();
    next();
  }
}
