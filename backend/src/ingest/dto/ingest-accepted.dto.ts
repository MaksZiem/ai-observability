import { ApiProperty } from '@nestjs/swagger';

export class IngestAcceptedDto {
  @ApiProperty({
    description: 'Liczba elementów przyjętych do kolejki',
    example: 25,
  })
  accepted: number;
}
