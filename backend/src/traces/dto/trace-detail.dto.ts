import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Span } from '../entities/span.entity.js';

export class TraceDetailDto {
  traceId: string;

  @ApiPropertyOptional({
    description: 'Span bez rodzica (początek żądania)',
    type: () => Span,
    nullable: true,
  })
  rootSpan: Span | null;

  startTime: Date;
  durationMs: number;
  spanCount: number;

  @ApiProperty({ type: [String] })
  services: string[];

  hasError: boolean;

  @ApiProperty({ type: () => Span, isArray: true })
  spans: Span[];
}
