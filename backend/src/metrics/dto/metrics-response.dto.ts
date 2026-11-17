import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceStatus } from '../request-stats.js';

export class RequestStatsDto {
  @ApiProperty({ description: 'Liczba żądań (spanów typu server)' })
  requests: number;

  errors: number;

  @ApiProperty({ description: 'Odsetek błędów od 0 do 1', example: 0.028 })
  errorRate: number;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 842 })
  p95LatencyMs: number | null;
}

export class SeriesPointDto extends RequestStatsDto {
  @ApiProperty({ description: 'Początek przedziału czasu' })
  bucket: Date;
}

export class OverviewDto {
  from: Date;
  to: Date;

  @ApiProperty({ description: 'Szerokość przedziału serii w ms' })
  stepMs: number;

  summary: RequestStatsDto;

  @ApiProperty({ type: () => SeriesPointDto, isArray: true })
  series: SeriesPointDto[];
}

export class ServiceHealthDto extends RequestStatsDto {
  @ApiProperty({ example: 'payment-service' })
  service: string;

  @ApiProperty({ enum: ServiceStatus })
  status: ServiceStatus;
}
