import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../entities/project.entity.js';

export class ProjectWithApiKeyDto {
  project: Project;

  @ApiProperty({
    description:
      'Pełny klucz API. Jest zwracany tylko raz, serwer przechowuje wyłącznie jego hash',
    example: 'obs_8f3a2c1d9e7b4a6f...',
  })
  apiKey: string;
}
