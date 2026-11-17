import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IngestCountersDto {
  requests: number;
  items: number;
  stored: number;
  rejected: number;
  failed: number;
  retried: number;
  deadLettered: number;
}

export class IngestByTypeDto {
  logs: IngestCountersDto;
  spans: IngestCountersDto;
  errors: IngestCountersDto;
  deployments: IngestCountersDto;
}

export class PercentilesDto {
  count: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  p50: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  p95: number | null;
}

export class OutcomeCountersDto {
  succeeded: number;
  failed: number;
}

export class OutcomesDto {
  analyses: OutcomeCountersDto;
  chat: OutcomeCountersDto;
  webhooks: OutcomeCountersDto;
}

export class AlertRunsDto {
  runs: number;
  failedEvaluations: number;

  @ApiPropertyOptional({ type: Date, nullable: true })
  lastRunAt: Date | null;
}

export class QueueDepthDto {
  waiting: number;
  active: number;
  delayed: number;
  deadLettered: number;
}

export class PlatformStatsDto {
  startedAt: Date;
  uptimeSeconds: number;

  @ApiProperty({ description: 'Liczniki ingestu według typu telemetrii' })
  ingest: IngestByTypeDto;

  @ApiProperty({ description: 'Czas obsługi żądania ingestu w ms' })
  ingestDurationMs: PercentilesDto;

  @ApiProperty({
    description: 'Opóźnienie od zdarzenia w aplikacji do zapisu w ms',
  })
  telemetryLagMs: PercentilesDto;

  @ApiProperty({ description: 'Czas oczekiwania w kolejce w ms' })
  queueLagMs: PercentilesDto;

  @ApiProperty({ description: 'Wyniki analiz AI, czatu i webhooków' })
  outcomes: OutcomesDto;

  alerts: AlertRunsDto;

  @ApiPropertyOptional({
    description: 'Stan kolejki ingestu; null, gdy kolejka jest niedostępna',
    type: () => QueueDepthDto,
    nullable: true,
  })
  queue: QueueDepthDto | null;
}
