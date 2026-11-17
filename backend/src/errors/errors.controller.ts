import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
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
import { ListErrorEventsQueryDto } from './dto/list-error-events-query.dto.js';
import { ListErrorGroupsQueryDto } from './dto/list-error-groups-query.dto.js';
import { UpdateErrorGroupDto } from './dto/update-error-group.dto.js';
import { ErrorEvent } from './entities/error-event.entity.js';
import { ErrorGroup } from './entities/error-group.entity.js';
import { ErrorsService } from './errors.service.js';

@ApiTags('errors')
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
@Controller('projects/:projectId/errors')
export class ErrorsController {
  constructor(
    private readonly errorsService: ErrorsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lista grup błędów',
    description:
      'Podobne błędy są łączone w grupy po odcisku (usługa, typ i znormalizowany komunikat). Sortowanie od ostatnio widzianych.',
  })
  @ApiOkResponse({
    description: 'Grupy błędów',
    type: ErrorGroup,
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
    @Query() query: ListErrorGroupsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.errorsService.findAll(projectId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz grupę błędów' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator grupy błędów',
  })
  @ApiOkResponse({ description: 'Grupa błędów', type: ErrorGroup })
  @ApiNotFoundResponse({
    description: 'Projekt lub grupa błędów nie istnieje',
    type: NotFoundErrorDto,
  })
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.errorsService.findOne(projectId, id);
  }

  @Get(':id/events')
  @ApiOperation({
    summary: 'Wystąpienia błędu',
    description: 'Pojedyncze zdarzenia z grupy, ze stack trace i trace ID.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator grupy błędów',
  })
  @ApiOkResponse({
    description: 'Wystąpienia, od najnowszych',
    type: ErrorEvent,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe parametry zapytania',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub grupa błędów nie istnieje',
    type: NotFoundErrorDto,
  })
  async findEvents(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListErrorEventsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.errorsService.findEvents(projectId, id, query);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Zmień status grupy błędów',
    description: 'Statusy: open, investigating, resolved.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator grupy błędów',
  })
  @ApiOkResponse({ description: 'Zaktualizowana grupa', type: ErrorGroup })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowy status',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub grupa błędów nie istnieje',
    type: NotFoundErrorDto,
  })
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateErrorGroupDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.errorsService.update(projectId, id, dto);
  }
}
