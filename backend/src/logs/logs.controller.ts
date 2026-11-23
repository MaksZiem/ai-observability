import { Controller, Get, Param, Query } from '@nestjs/common';
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
import { ListLogsQueryDto } from './dto/list-logs-query.dto.js';
import { LogPageDto } from './dto/log-page.dto.js';
import { Log } from './entities/log.entity.js';
import { LogsService } from './logs.service.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@ApiTags('logs')
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
@Controller('projects/:projectId/logs')
export class LogsController {
  constructor(
    private readonly logsService: LogsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Przeglądaj logi',
    description:
      'Logi od najnowszych z filtrami po czasie, usłudze, poziomie, endpoincie, trace ID i request ID. Kolejną stronę pobiera się z kursorem nextCursor.',
  })
  @ApiOkResponse({ description: 'Strona logów', type: LogPageDto })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe parametry zapytania lub kursor',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  async findAll(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Query() query: ListLogsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.logsService.findAll(projectId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Szczegóły logu' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator logu' })
  @ApiOkResponse({ description: 'Log z atrybutami', type: Log })
  @ApiNotFoundResponse({
    description: 'Projekt lub log nie istnieje',
    type: NotFoundErrorDto,
  })
  async findOne(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.logsService.findOne(projectId, id);
  }
}
