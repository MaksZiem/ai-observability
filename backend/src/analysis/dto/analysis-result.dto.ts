import { ApiProperty } from '@nestjs/swagger';

export class ObservedFactDto {
  @ApiProperty({ description: 'Zaobserwowany fakt' })
  statement: string;

  @ApiProperty({ description: 'Dowód z telemetrii, który go potwierdza' })
  evidence: string;
}

export class HypothesisDto {
  @ApiProperty({ description: 'Możliwa przyczyna' })
  cause: string;

  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  confidence: 'low' | 'medium' | 'high';

  reasoning: string;
}

export class AnalysisResultDto {
  summary: string;

  @ApiProperty({
    description: 'Fakty potwierdzone danymi',
    type: () => ObservedFactDto,
    isArray: true,
  })
  observedFacts: ObservedFactDto[];

  @ApiProperty({
    description: 'Hipotezy, nie potwierdzone przyczyny',
    type: () => HypothesisDto,
    isArray: true,
  })
  hypotheses: HypothesisDto[];

  @ApiProperty({
    description: 'Wersje wdrożeń powiązane z incydentem',
    type: [String],
  })
  relatedDeployments: string[];

  @ApiProperty({ description: 'Sugerowane kroki dochodzenia', type: [String] })
  suggestedInvestigation: string[];
}
