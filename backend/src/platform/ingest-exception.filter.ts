import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter.js';
import type { Request } from 'express';
import { telemetryTypeOf } from './ingest-items.js';
import { PlatformStatsService } from './platform-stats.service.js';

@Catch()
export class IngestExceptionFilter extends HttpExceptionFilter {
  constructor(private readonly platformStats: PlatformStatsService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest<Request>();
    const type = telemetryTypeOf(request.path);

    if (type) {
      this.platformStats.recordIngestRejected(
        type,
        exception instanceof HttpException ? exception.getStatus() : 500,
      );
    }

    super.catch(exception, host);
  }
}
