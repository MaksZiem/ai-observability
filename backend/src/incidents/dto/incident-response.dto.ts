import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Deployment } from '../../deployments/entities/deployment.entity.js';
import { ErrorGroup } from '../../errors/entities/error-group.entity.js';
import { Log } from '../../logs/entities/log.entity.js';
import { TraceDetailDto } from '../../traces/dto/trace-detail.dto.js';
import { Incident } from '../entities/incident.entity.js';
import { TimelineEntryType } from '../incident-timeline.js';

export class IncidentEvidenceDto {
  @ApiProperty({ type: () => ErrorGroup, isArray: true })
  errorGroups: ErrorGroup[];

  @ApiProperty({ type: () => TraceDetailDto, isArray: true })
  traces: TraceDetailDto[];

  @ApiProperty({ type: () => Deployment, isArray: true })
  deployments: Deployment[];

  @ApiProperty({ type: () => Log, isArray: true })
  logs: Log[];
}

export class TimelineEntryDto {
  at: Date;

  @ApiProperty({ enum: TimelineEntryType })
  type: TimelineEntryType;

  title: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  detail: string | null;

  @ApiProperty({
    description: 'Wartości do przetłumaczonego opisu wpisu',
    type: 'object',
    additionalProperties: { oneOf: [{ type: 'string' }, { type: 'number' }] },
  })
  params: Record<string, string | number>;

  @ApiPropertyOptional({
    description: 'Identyfikator obiektu, którego dotyczy wpis',
    type: String,
    nullable: true,
  })
  refId: string | null;
}

export class SimilarityMatchDto {
  @ApiProperty({ enum: ['error', 'service', 'title'] })
  kind: 'error' | 'service' | 'title';

  @ApiPropertyOptional({ type: String, nullable: true })
  value: string | null;
}

export class SimilarIncidentDto {
  incident: Incident;

  @ApiProperty({ description: 'Podobieństwo od 0 do 1', example: 0.62 })
  score: number;

  @ApiProperty({ type: [String] })
  reasons: string[];

  @ApiProperty({ type: () => SimilarityMatchDto, isArray: true })
  matches: SimilarityMatchDto[];
}
