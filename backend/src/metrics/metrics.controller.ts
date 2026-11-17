import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import {
  BadRequestErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { ProjectsService } from '../projects/projects.service.js';
import { MetricsQueryDto } from './dto/metrics-query.dto.js';
import { OverviewDto, ServiceHealthDto } from './dto/metrics-response.dto.js';
import { MetricsService } from './metrics.service.js';

@ApiTags('metrics')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@ApiParam({
  name: 'projectId',
  format: 'uuid',
  description: 'Identyfikator projektu',
})
@ApiBadRequestResponse({
  description: 'Nieprawidłowy zakres czasu lub usługa',
  type: BadRequestErrorDto,
})
@ApiNotFoundResponse({
  description: 'Projekt nie istnieje lub należy do innego użytkownika',
  type: NotFoundErrorDto,
})
@Controller('projects/:projectId/metrics')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Przegląd metryk',
    description:
      'Liczba żądań, błędy, error rate i p95 opóźnienia w wybranym zakresie, razem z serią czasową do wykresów.',
  })
  @ApiOkResponse({ description: 'Podsumowanie i seria', type: OverviewDto })
  async getOverview(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: MetricsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.metricsService.getOverview(projectId, query);
  }

  @Get('services')
  @ApiOperation({
    summary: 'Stan usług',
    description:
      'Metryki każdej usługi i jej status (healthy, degraded, critical) wyliczony z error rate i p95 opóźnienia.',
  })
  @ApiOkResponse({
    description: 'Usługi projektu',
    type: ServiceHealthDto,
    isArray: true,
  })
  async getServices(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: MetricsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.metricsService.getServices(projectId, query);
  }
}
