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
import { ListTracesQueryDto } from './dto/list-traces-query.dto.js';
import { TraceDetailDto } from './dto/trace-detail.dto.js';
import { Span } from './entities/span.entity.js';
import { TracesService } from './traces.service.js';

@ApiTags('traces')
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
@Controller('projects/:projectId/traces')
export class TracesController {
  constructor(
    private readonly tracesService: TracesService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lista śladów',
    description:
      'Spany główne (bez rodzica), od najnowszych, z filtrami po usłudze, statusie, minimalnym czasie trwania i czasie.',
  })
  @ApiOkResponse({
    description: 'Spany główne śladów',
    type: Span,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe parametry zapytania',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  async findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ListTracesQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.tracesService.findAll(projectId, query);
  }

  @Get(':traceId')
  @ApiOperation({
    summary: 'Szczegóły śladu',
    description: 'Wszystkie spany śladu z czasem trwania i listą usług.',
  })
  @ApiParam({
    name: 'traceId',
    description: 'Trace ID nadany przez aplikację',
    example: '4bf92f3577b34da6a3ce929d0e0e4736',
  })
  @ApiOkResponse({ description: 'Ślad', type: TraceDetailDto })
  @ApiNotFoundResponse({
    description: 'Projekt lub ślad nie istnieje',
    type: NotFoundErrorDto,
  })
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('traceId') traceId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.tracesService.findOne(projectId, traceId);
  }
}
