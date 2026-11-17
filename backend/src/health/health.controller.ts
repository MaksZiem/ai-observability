import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../auth/decorators/public.decorator.js';
import { AlertSchedulerHealthIndicator } from './alert-scheduler.health.js';
import { IngestQueueHealthIndicator } from './ingest-queue.health.js';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly alertScheduler: AlertSchedulerHealthIndicator,
    private readonly ingestQueue: IngestQueueHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Stan aplikacji',
    description:
      'Sprawdza bazę danych, harmonogram alertów i kolejkę ingestu. Zwraca 503, gdy któraś zależność nie działa.',
  })
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.alertScheduler.check('alertScheduler'),
      () => this.ingestQueue.check('ingestQueue'),
    ]);
  }
}
