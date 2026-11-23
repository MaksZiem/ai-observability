import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
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
  ConflictErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { ProjectsService } from '../projects/projects.service.js';
import { CreateIncidentLinkDto } from './dto/create-incident-link.dto.js';
import { CreateIncidentNoteDto } from './dto/create-incident-note.dto.js';
import { CreateIncidentDto } from './dto/create-incident.dto.js';
import {
  IncidentEvidenceDto,
  SimilarIncidentDto,
  TimelineEntryDto,
} from './dto/incident-response.dto.js';
import { ListIncidentsQueryDto } from './dto/list-incidents-query.dto.js';
import { UpdateIncidentDto } from './dto/update-incident.dto.js';
import { IncidentLink } from './entities/incident-link.entity.js';
import { IncidentNote } from './entities/incident-note.entity.js';
import { Incident } from './entities/incident.entity.js';
import { IncidentEvidenceService } from './incident-evidence.service.js';
import { IncidentsService } from './incidents.service.js';
import { SimilarIncidentsService } from './similar-incidents.service.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@ApiTags('incidents')
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
@Controller('projects/:projectId/incidents')
export class IncidentsController {
  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly evidenceService: IncidentEvidenceService,
    private readonly similarService: SimilarIncidentsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Utwórz incydent',
    description: 'Incydent dostaje kolejny numer w projekcie (np. #382).',
  })
  @ApiCreatedResponse({ description: 'Utworzony incydent', type: Incident })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  async create(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Body() dto: CreateIncidentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.create(projectId, user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista incydentów projektu' })
  @ApiOkResponse({
    description: 'Incydenty',
    type: Incident,
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
    @Param('projectId', ParseIdPipe) projectId: string,
    @Query() query: ListIncidentsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.findAll(projectId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz incydent' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator incydentu',
  })
  @ApiOkResponse({ description: 'Incydent', type: Incident })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  async findOne(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.findOne(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Zaktualizuj incydent',
    description:
      'Pola pominięte w body pozostają bez zmian. Zmiana statusu na resolved ustawia resolvedAt, a powrót do innego statusu je czyści.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator incydentu',
  })
  @ApiOkResponse({ description: 'Zaktualizowany incydent', type: Incident })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  async update(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: UpdateIncidentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.update(projectId, id, dto);
  }

  @Get(':id/evidence')
  @ApiOperation({
    summary: 'Dowody incydentu',
    description:
      'Grupy błędów, ślady, wdrożenia i logi powiązane z incydentem. Na tych danych pracuje analiza AI.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator incydentu',
  })
  @ApiOkResponse({ description: 'Dowody', type: IncidentEvidenceDto })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  async getEvidence(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.evidenceService.getEvidence(projectId, id);
  }

  @Get(':id/timeline')
  @ApiOperation({
    summary: 'Oś czasu incydentu',
    description:
      'Zdarzenia wygenerowane z danych systemu: wdrożenia, skoki opóźnień i błędów, pierwsze wystąpienia błędów, notatki, utworzenie i rozwiązanie incydentu.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator incydentu',
  })
  @ApiOkResponse({
    description: 'Wpisy osi czasu w kolejności chronologicznej',
    type: TimelineEntryDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  async getTimeline(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.evidenceService.getTimeline(projectId, id);
  }

  @Get(':id/similar')
  @ApiOperation({
    summary: 'Podobne incydenty',
    description:
      'Do 5 wcześniejszych incydentów podobnych pod względem typów błędów, usług i słów w tytule, z wynikiem i uzasadnieniem.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator incydentu',
  })
  @ApiOkResponse({
    description: 'Podobne incydenty, od najbardziej podobnych',
    type: SimilarIncidentDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  async findSimilar(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.similarService.findSimilar(projectId, id);
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'Notatki incydentu' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator incydentu',
  })
  @ApiOkResponse({
    description: 'Notatki z autorem',
    type: IncidentNote,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  async findNotes(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.findNotes(projectId, id);
  }

  @Post(':id/notes')
  @ApiOperation({
    summary: 'Dodaj notatkę',
    description: 'Notatka pojawia się też na osi czasu incydentu.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator incydentu',
  })
  @ApiCreatedResponse({ description: 'Dodana notatka', type: IncidentNote })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  async addNote(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: CreateIncidentNoteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.addNote(projectId, id, user.sub, dto);
  }

  @Get(':id/links')
  @ApiOperation({
    summary: 'Powiązania incydentu',
    description:
      'Grupy błędów, ślady, wdrożenia i logi ręcznie powiązane z incydentem.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator incydentu',
  })
  @ApiOkResponse({
    description: 'Powiązania',
    type: IncidentLink,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  async findLinks(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.findLinks(projectId, id);
  }

  @Post(':id/links')
  @ApiOperation({
    summary: 'Powiąż obiekt z incydentem',
    description:
      'targetId to UUID grupy błędów, wdrożenia lub logu albo trace ID śladu.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator incydentu',
  })
  @ApiCreatedResponse({
    description: 'Utworzone powiązanie',
    type: IncidentLink,
  })
  @ApiBadRequestResponse({
    description:
      'Nieprawidłowe dane lub targetId nie jest UUID (kod INCIDENT_TARGET_INVALID)',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt, incydent lub powiązywany obiekt nie istnieje',
    type: NotFoundErrorDto,
  })
  @ApiConflictResponse({
    description: 'Obiekt jest już powiązany (kod INCIDENT_LINK_EXISTS)',
    type: ConflictErrorDto,
  })
  async addLink(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: CreateIncidentLinkDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.addLink(projectId, id, dto);
  }

  @Delete(':id/links/:linkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Usuń powiązanie' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator incydentu',
  })
  @ApiParam({
    name: 'linkId',
    format: 'uuid',
    description: 'Identyfikator powiązania',
  })
  @ApiNoContentResponse({ description: 'Powiązanie usunięte' })
  @ApiNotFoundResponse({
    description: 'Projekt, incydent lub powiązanie nie istnieje',
    type: NotFoundErrorDto,
  })
  async removeLink(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('id', ParseIdPipe) id: string,
    @Param('linkId', ParseIdPipe) linkId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.removeLink(projectId, id, linkId);
  }
}
