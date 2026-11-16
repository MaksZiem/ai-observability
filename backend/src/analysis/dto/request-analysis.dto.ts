import { IsIn, IsOptional } from 'class-validator';

export const ANALYSIS_LANGUAGES = ['pl', 'en'] as const;

export type AnalysisLanguage = (typeof ANALYSIS_LANGUAGES)[number];

export class RequestAnalysisDto {
  @IsOptional()
  @IsIn(ANALYSIS_LANGUAGES)
  language?: AnalysisLanguage;
}
