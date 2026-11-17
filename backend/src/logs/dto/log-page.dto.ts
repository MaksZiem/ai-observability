import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Log } from '../entities/log.entity.js';

export class LogPageDto {
  @ApiProperty({ type: () => Log, isArray: true })
  items: Log[];

  @ApiPropertyOptional({
    description:
      'Kursor kolejnej strony (parametr cursor); null, gdy to ostatnia strona',
    type: String,
    nullable: true,
  })
  nextCursor: string | null;
}
