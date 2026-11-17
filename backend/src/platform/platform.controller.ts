import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedErrorDto } from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { PlatformStatsDto } from './dto/platform-stats.dto.js';
import { PlatformStatsService } from './platform-stats.service.js';

@ApiTags('platform')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@Controller('platform')
export class PlatformController {
  constructor(private readonly platformStats: PlatformStatsService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Statystyki platformy',
    description:
      'Jak działa sama platforma od startu procesu: przyjęta, zapisana i odrzucona telemetria, opóźnienia ingestu, stan kolejki, wyniki AI i webhooków oraz przebiegi alertów.',
  })
  @ApiOkResponse({ description: 'Statystyki', type: PlatformStatsDto })
  async getStats() {
    return {
      ...this.platformStats.snapshot(),
      queue: await this.platformStats.queueDepth(),
    };
  }
}
